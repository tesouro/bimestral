library(tidyverse)
library(readxl)
library(jsonlite)

nome_planilha <- 'planilhas-bimestral-2024-5bim.xlsx'

grandes_numeros_raw <- read_excel(nome_planilha, sheet = 'Sumario', skip = 1)

grandes_numeros <- grandes_numeros_raw %>%
  filter(!is.na(`Discriminação`)) %>%
  mutate(across(where(is.numeric), ~round(./1000, 0)))


# termos de interesse -----------------------------------------------------


termo_loa <- "LOA 2024\r\n(a)"
termo_reav <- "Avaliação \r\n5º Bimestre\r\n(c)"

termo_receita_bruta <- "1. Receita Primária Total"
termo_receita_liquida <- "3. Receita Líquida (1) - (2)"

termo_despesa <- "4. Despesas Primárias"
termo_transf <- "2. Transferências por Repartição de Receita"
termo_resultado <- "5. Resultado Primário (3) - (4)"
termo_meta <- "6. Meta de Resultado Primário OFS (art. 2º, caput, da LDO-2024)"

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

resultado_loa <- grandes_numeros[[get_posicao(termo_resultado), termo_loa]]
resultado_reav <- grandes_numeros[[get_posicao(termo_resultado), termo_reav]]

resultado <- list(
  nome = 'resultado',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(
    ifelse(resultado_loa < 0, termo_receita_liquida, termo_despesa)
    ), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(
    ifelse(resultado_reav < 0, termo_receita_liquida, termo_despesa)
    ), termo_reav]],
  
  loa = abs(grandes_numeros[[get_posicao(termo_resultado), termo_loa]]),
  reav = abs(grandes_numeros[[get_posicao(termo_resultado), termo_reav]])
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

teto <- list(

    nome = 'teto dos gastos',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = 0,
  posicao_inicial_reav = 0,
  
  loa = round(1679572.80847003/1000, 0),
  reav = round(1680992.78983395/1000, 0)
  
)

# output - grandes números ------------------------------------------------

grandes_numeros_sumario <- list(
  receita = receita,
  despesa = despesa,
  transferencias = transferencias,
  resultado = resultado,
  meta = meta,
  teto = teto
  #obrigatorias = obrig,
  #discricionarias = discr
)

# receitas - detalhados ---------------------------------------------------

rec_det_raw <- read_excel(nome_planilha, sheet = 'Receitas', skip = 1)

# linhas_rec_que_nao_interessam <- c(
#   "I. RECEITA TOTAL",
#   "Receita Administrada pela RFB/ME (exceto RGPS)",
#   "Receitas Não-Administradas pela RFB",
#   "CPMF"
# )

linha_transferencia <- "II. TRANSFERÊNCIAS POR REPARTIÇÃO DE RECEITA"
numero_linha_transferencia <- which(rec_det_raw$Discriminação == linha_transferencia)
termo_reav_rec <- termo_reav#"Avaliação 1º Bimestre\r\n(b)"

rec_det <- rec_det_raw %>%
  select(c("Discriminação", termo_loa, termo_reav_rec, justificativa)) %>%
  filter(row_number() < numero_linha_transferencia) %>%
  filter(justificativa != "") %>%
  #filter(!(`Discriminação` %in% linhas_rec_que_nao_interessam)) %>%
  filter(!is.na(!!sym(termo_loa))) %>%
  filter(!is.na(`Discriminação`)) %>%
  filter(!!sym(termo_reav_rec) > 0) %>%
  mutate(
    nome = ifelse(!!sym(termo_reav_rec) < 1000, "Outras", `Discriminação`),
    justificativa = ifelse(is.na(justificativa), 'sem análise específica.', justificativa)
  )

rec_det_pre <- rec_det %>%
  select(-`Discriminação`) %>%
  group_by(nome) %>%
  summarise(across(where(is.numeric), sum)) %>%
  ungroup() %>%
  mutate(
    valor_quadradinhos_reav = round(!!sym(termo_reav_rec)/1000, 0),
    valor_quadradinhos_loa = round(!!sym(termo_loa)/1000, 0)
  ) %>%
  rename(
    loa = !!sym(termo_loa),
    reav = !!sym(termo_reav_rec)) %>%
  mutate(
    # esses dois primeiros mutates aqui é por causa do arredondamento
    valor_quadradinhos_reav = ifelse(
      nome == "Demais Receitas", 
      valor_quadradinhos_reav + grandes_numeros$receita$bruta$reav - sum(valor_quadradinhos_reav),
      valor_quadradinhos_reav),
    valor_quadradinhos_loa = ifelse(
      nome == "Demais Receitas", 
      valor_quadradinhos_loa + grandes_numeros$receita$bruta$loa - sum(valor_quadradinhos_loa),
      valor_quadradinhos_loa)
  ) 

rec_det_pre$percent_reav <- rec_det_pre$reav / sum(rec_det_pre$reav)

rec_justificativas <- rec_det %>%
  select(nome, justificativa)

rec_det_export <- rec_det_pre %>%
  arrange(-valor_quadradinhos_reav) %>%
  mutate(
    posicao_inicial_loa = 0 + cumsum(lag(valor_quadradinhos_loa,1, default = 0)),
    posicao_inicial_reav = 0 + cumsum(lag(valor_quadradinhos_reav,1, default = 0)),
    categoria = "itens-receita"
  ) %>%
  arrange(-percent_reav) %>%
  mutate(percent_reav_cum = cumsum(percent_reav)) %>%
  left_join(rec_justificativas)

# despesas - detalhados ---------------------------------------------------

desp_det_raw <- read_excel(nome_planilha, sheet = 'Despesas1', skip = 2)

desp_det <- desp_det_raw[!is.na(desp_det_raw[,2]),] %>%
  select(c("Descrição", termo_loa, termo_reav, justificativa)) %>%
  #filter(!(`Descrição` %in% c('Total', 'Despesas do Poder Executivo Sujeitas à Programação Financeira'))) %>%
  filter(justificativa != "") %>%
  filter(!!sym(termo_reav) > 0) %>%
  mutate(
    nome = ifelse(!!sym(termo_reav) < 10000, "Demais", `Descrição`),
    justificativa = ifelse(is.na(justificativa), 'sem análise específica.', justificativa)
  )

desp_det_pre <- desp_det %>%
  select(-`Descrição`) %>%
  group_by(nome) %>%
  summarise(across(where(is.numeric), sum)) %>%
  ungroup() %>%
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

desp_justificativas <- desp_det %>%
  group_by(nome) %>%
  summarise(justificativa = first(justificativa)) %>%
  mutate(justificativa = ifelse(nome == 'Demais', 'sem análise específica.', justificativa))

desp_det_export <- desp_det_pre %>%
  arrange(-valor_quadradinhos_reav) %>%
  mutate(
    posicao_inicial_loa = 0 + cumsum(lag(valor_quadradinhos_loa,1, default = 0)),
    posicao_inicial_reav = 0 + cumsum(lag(valor_quadradinhos_reav,1, default = 0)),
    categoria = "itens-despesa"
  ) %>%
  arrange(-percent_reav) %>%
  mutate(percent_reav_cum = cumsum(percent_reav)) %>%
  left_join(desp_justificativas)

# export de novo ----------------------------------------------------------

output <- list(
  grandes_numeros = grandes_numeros_sumario,
  itens_despesas = desp_det_export,
  itens_receitas = rec_det_export
)

jsonlite::write_json(output, '../output.json', auto_unbox = TRUE)
