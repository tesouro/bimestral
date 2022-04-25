library(tidyverse)
library(readxl)
library(jsonlite)

grandes_numeros_raw <- read_excel('planilhas-bimestral-2022-1bim.xlsx', sheet = '1', skip = 2)

grandes_numeros <- grandes_numeros_raw %>%
  filter(!is.na(`Discriminação`))


# termos de interesse -----------------------------------------------------


termo_loa <- "LOA 2022\r\n(a)"
termo_reav <- "Avaliação \r\n1º Bimestre\r\n(b)"

termo_receita_bruta <- "1. Receita Primária Total"
termo_receita_liquida <- "3. Receita Líquida (1) - (2)"

termo_despesa <- "4. Despesas Primárias"
termo_transf <- "2. Transferências por Repartição de Receita"

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
  
  loa = grandes_numeros[[get_posicao(termo_despesa), termo_loa]],
  reav = grandes_numeros[[get_posicao(termo_despesa), termo_reav]]
)

transferencias <- list(
  nome = 'transferências',
  categoria = 'grande-numero',
  
  posicao_inicial_loa = grandes_numeros[[get_posicao(termo_receita_liquida), termo_loa]],
  posicao_inicial_reav = grandes_numeros[[get_posicao(termo_receita_liquida), termo_reav]],
  
  loa = grandes_numeros[[get_posicao(termo_transf), termo_loa]],
  reav = grandes_numeros[[get_posicao(termo_transf), termo_reav]]
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

output <- list(
  receita = receita,
  despesas = despesa,
  transferencias = transferencias,
  obrigatorias = obrig,
  discricionarias = discr
)

jsonlite::write_json(output, 'output.json', auto_unbox = TRUE)


