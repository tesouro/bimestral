library(tidyverse)
library(readxl)
library(jsonlite)

grandes_numeros_raw <- read_excel('planilhas-bimestral-2022-1bim.xlsx', sheet = '1', skip = 2)

grandes_numeros <- grandes_numeros_raw %>%
  filter(!is.na(`Discriminação`)) %>%
  mutate(across(where(is.numeric), ~round(./1000, 0)))


# termos de interesse -----------------------------------------------------


termo_loa <- "LOA 2022\r\n(a)"
termo_reav <- "Avaliação \r\n1º Bimestre\r\n(b)"

termo_receita_bruta <- "1. Receita Primária Total"
termo_receita_liquida <- "3. Receita Líquida (1) - (2)"

termo_despesa <- "4. Despesas Primárias"
termo_transf <- "2. Transferências por Repartição de Receita"
termo_resultado <- "5. Resultado Primário (3) - (4)"
termo_meta <- "6. Meta de Resultado Primário OFS (Art. 2º, caput, LDO-2022)"

termo_obrig <- "Obrigatórias"
termo_discr <- "Discricionárias do Poder Executivo"


# funcao para pegar posicao do termo --------------------------------------

get_posicao <- function(termo) {
  
  return(which(grandes_numeros$Discriminação == termo))
  
}


# objetos de interesse ----------------------------------------------------

receita <- list(
  nome = 'receita',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = 0,
  posicao_inicial_reav = 0,
  
  bruta = list(
    loa = grandes_numeros[[get_posicao(termo_receita_bruta), termo_loa]],
    reav = grandes_numeros[[get_posicao(termo_receita_bruta), termo_reav]]
  ),
  
  liquida = list(
    loa = grandes_numeros[[get_posicao(termo_receita_liquida), termo_loa]],
    reav = grandes_numeros[[get_posicao(termo_receita_liquida), termo_reav]]
  )
  
)

despesa <- list(
  nome = 'despesa',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = 0,
  posicao_inicial_reav = 0,
  
  loa = grandes_numeros[[get_posicao(termo_despesa), termo_loa]],
  reav = grandes_numeros[[get_posicao(termo_despesa), termo_reav]]
)

transferencias <- list(
  nome = 'transferências',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(termo_receita_liquida), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(termo_receita_liquida), termo_reav]],
  
  loa = grandes_numeros[[get_posicao(termo_transf), termo_loa]] + 1,
  reav = grandes_numeros[[get_posicao(termo_transf), termo_reav]]
)

resultado <- list(
  nome = 'resultado',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(termo_receita_liquida), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(termo_receita_liquida), termo_reav]],
  
  loa = -grandes_numeros[[get_posicao(termo_resultado), termo_loa]],
  reav = -grandes_numeros[[get_posicao(termo_resultado), termo_reav]]
)

meta <- list(
  nome = 'meta',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(termo_receita_liquida), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(termo_receita_liquida), termo_reav]],
  
  loa = -grandes_numeros[[get_posicao(termo_meta), termo_loa]],
  reav = -grandes_numeros[[get_posicao(termo_meta), termo_reav]]
)


obrig <- list(
  nome = 'despesas obrigatórias',
  categoria = 'despesas',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(termo_discr), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(termo_discr), termo_reav]],
  
  loa = grandes_numeros[[get_posicao(termo_obrig), termo_loa]],
  reav = grandes_numeros[[get_posicao(termo_obrig), termo_reav]]
)

discr <- list(
  nome = 'despesas discricionárias',
  categoria = 'despesas',
  
  posicao_inicial_loa = 0,
  posicao_inicial_reav = 0,
  
  loa = grandes_numeros[[get_posicao(termo_discr), termo_loa]],
  reav = grandes_numeros[[get_posicao(termo_discr), termo_reav]]
)


# output - grandes números ------------------------------------------------

grandes_numeros <- list(
  receita = receita,
  despesa = despesa,
  transferencias = transferencias,
  resultado = resultado,
  meta = meta
  #obrigatorias = obrig,
  #discricionarias = discr
)





# despesas - detalhados ---------------------------------------------------

desp_det_raw <- read_excel('planilhas-bimestral-2022-1bim.xlsx', sheet = '5', skip = 4)

desp_det <- desp_det_raw[!is.na(desp_det_raw[,2]),] %>%
  select(c("Descrição", termo_loa, termo_reav)) %>%
  filter(!(`Descrição` %in% c('Total', 'Despesas do Poder Executivo Sujeitas à Programação Financeira'))) %>%
  filter(!!sym(termo_reav) > 0) %>%
  mutate(
    nome = ifelse(!!sym(termo_reav) < 1000, "Demais", `Descrição`)
  )

desp_det_pre <- desp_det %>%
  select(-`Descrição`) %>%
  group_by(nome) %>%
  summarise(across(where(is.numeric), sum)) %>%
  mutate(
    valor_quadradinhos_reav = round(!!sym(termo_reav)/1000, 0),
    valor_quadradinhos_loa = round(!!sym(termo_loa)/1000, 0)
  ) %>%
  rename(
    loa = !!sym(termo_loa),
    reav = !!sym(termo_reav)) %>%
  mutate(
    # esses dois primeiros mutates aqui é por causa do arredondamento
    valor_quadradinhos_reav = ifelse(
      nome == "Demais", 
      valor_quadradinhos_reav + grandes_numeros$despesa$reav - sum(valor_quadradinhos_reav),
      valor_quadradinhos_reav),
    valor_quadradinhos_loa = ifelse(
      nome == "Demais", 
      valor_quadradinhos_loa + grandes_numeros$despesa$loa - sum(valor_quadradinhos_loa),
      valor_quadradinhos_loa)
  ) 
    
desp_det_pre$percent_reav <- desp_det_pre$reav / sum(desp_det_pre$reav)
#desp_det_pre$percent_reav <- desp_det_pre$valor_quadradinhos_reav / sum(desp_det_pre$valor_quadradinhos_reav)


desp_det_export <- desp_det_pre %>%
  arrange(-valor_quadradinhos_reav) %>%
  mutate(
    posicao_inicial_loa = 0 + cumsum(lag(valor_quadradinhos_loa,1, default = 0)),
    posicao_inicial_reav = 0 + cumsum(lag(valor_quadradinhos_reav,1, default = 0)),
    categoria = "itens-despesa"
  ) %>%
  arrange(-percent_reav) %>%
  mutate(percent_reav_cum = cumsum(percent_reav))

# export de novo ----------------------------------------------------------

output <- list(
  grandes_numeros = grandes_numeros,
  itens_despesas = desp_det_export
)

jsonlite::write_json(output, '../output.json', auto_unbox = TRUE)
