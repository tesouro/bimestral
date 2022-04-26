/*
const v = {

    control : {

        init : () => {

            v.refs.set();
            v.sizings.get();
            v.grid.calcula_parametros();
            //v.sizings.resize();

            v.params.set_css();

            //v.contornos.update_dimensoes_pattern();


        }

    },

    params : {

        fixos: {

            l : 6,
            gap : 2,
            qde : 2000

        },

        calculados : {

            ncol : null,
            nrow : null,
            deslocamento_meio : null,
            deslocamento_canto : null

        },

        set_css : () => {

            const params = v.params.fixos;

            const variaveis = ['l', 'gap'];

            variaveis.forEach(variavel => {
                
                document.documentElement.style.setProperty(`--${variavel}`, params[variavel] + 'px');

            })

        }

    },

    dados :  {

    },

    refs : {

        lista : [

            {
                nome: 'svg',
                ref : 'svg',
                multiplo: false
            },

            {
                nome: 'container',
                ref : '.wrapper',
                multiplo: false
            },


        ],

        svg : null,
        container : null,

        set : () => {

            const nomes = v.refs.lista;

            nomes.forEach(ref => {

                v.refs[ref.nome] = ref.multiplo ?
                  document.querySelectorAll(ref.ref) :
                  document.querySelector(ref.ref)
                ;

            })

        }

        //

    },

    sizings : {

        valores : {

            w : null,
            h : null

        },

        get : () => {

            const svg = v.refs.svg;

            const w = +window.getComputedStyle(svg).width.slice(0,-2);
            const h = +window.getComputedStyle(svg).height.slice(0,-2);

            v.sizings.valores.w = w;
            v.sizings.valores.h = h;
            
            svg.setAttribute('viewBox', `${0} ${0} ${w} ${h}`)

            console.log(v.sizings.valores);

        },

        resize : () => {

            const ncol = v.params.calculados.ncol;
            const { l, gap } = v.params.fixos;

            const new_w = ncol * ( gap + l ) + gap;

            v.sizings.valores.w = new_w;

            v.sizings.valores.h = new_w;

            const svg = v.refs.svg;

            //svg.style.width = new_w + 'px';
            //svg.style.height = new_w + 'px';

        }


    },

    grid : {

        calcula_parametros : () => {

            const { w , h } = v.sizings.valores;
            const [ W , H ] = [380 , 600];

            const { l, gap } = v.params.fixos;

            const ncol = Math.floor( ( W - gap ) / ( l + gap ) );

            v.params.calculados.ncol = ncol;

            const nrow = ncol;

            console.log(ncol);

        }
    },

    bolhas : {

        converte_para_bolhas: (id) => {

            const elem = document.querySelector(`path[data-id="${id}"]`);
            const d = elem.getAttribute('d');

            const bbox = elem.getBBox();

            const x_center = bbox.x + bbox.width/2;
            const y_center = bbox.y + bbox.height/2;

            d3.select(`path[data-id="${id}"]`)
              .transition()
              .duration(2000)
              .attrTween('d', () => flubber.toCircle(d, x_center, y_center, 50, {maxSegmentLength: 1}))
            ;

        },

        converte_de_bolhas: (id) => {

            const elem = document.querySelector(`path[data-id="${id}"]`);
            const d = elem.getAttribute('d');

            const bbox = elem.getBBox();

            const x_center = bbox.x + bbox.width/2;
            const y_center = bbox.y + bbox.height/2;

            d3.select(`path[data-id="${id}"]`)
              .transition()
              .duration(2000)
              .attrTween('d', () => flubber.fromCircle(x_center, y_center, 50, d, {maxSegmentLength: 1}))
            ;

        }

    }

}
*/
//v.control.init();

class Chart {

    // referencias para os elementos
    elemento;
    container;

    // dimensoes do grafico
    w;
    h;

    // parâmetros
    l = 6;
    gap = 2;
    ncol;

    constructor(max_valor) {

        this.set_refs();
        this.get_sizes();
        this.set_viewbox();
        this.calcula_parametros(max_valor);
        this.set_css();

    }

    set_refs() {

        const nomes = [

            {
                nome: 'elemento',
                ref : 'svg',
                multiplo: false
            },
    
            {
                nome: 'container',
                ref : '.wrapper',
                multiplo: false
            },
    
    
        ];

        nomes.forEach(ref => {

            this[ref.nome] = ref.multiplo ?
              document.querySelectorAll(ref.ref) :
              document.querySelector(ref.ref)
            ;

        })

    }

    get_sizes() {

        // o container do gráfico está definido com unidades relativas
        // o css faz com que o svg tenha 100% das dimensões do container
        // então aqui simplesmente capturamos as dimensões efetivas em pixel

        const w = +window.getComputedStyle(this.elemento).width.slice(0,-2);
        const h = +window.getComputedStyle(this.elemento).height.slice(0,-2);

        this.w = w;
        this.h = h;

    }

    set_viewbox() {

        // importante setar o viewBox para o gráfico ficar "responsivo"
        
        this.elemento.setAttribute('viewBox', `${0} ${0} ${this.w} ${this.h}`)

    }

    calcula_parametros(max_valor) {

        const { w , h, l, gap } = this ;

        console.log(w , h, l, gap);

        const [ W , H ] = [0.4 * w , 0.8 * h];

        const area = W * H;

        const area_quadradinho = area / max_valor;

        const lado_quadradinho = Math.floor(Math.sqrt(area_quadradinho));

        let new_l = lado_quadradinho - gap;

        console.log(area_quadradinho, Math.sqrt(area_quadradinho));

        const ncol = Math.floor( ( W - gap ) / ( new_l + gap ) );

        this.ncol = ncol;
        this.l = new_l;

        const nrow = ncol;

        console.log(ncol);

    }

    set_css() {

        const variaveis = ['l', 'gap'];

        variaveis.forEach(variavel => {
            
            document.documentElement.style.setProperty(`--${variavel}`, this[variavel] + 'px');

        })

    }
    
}

class GrandeNumero {

    nome;
    tipo;
    valor_loa;
    valor_reav;
    tamanho;
    posicao_inicial_loa;
    posicao_inicial_reav;
    X0; // posicao X inicial
    forma_inicial;

    d_loa;
    d_reav;

    interpolator_para_reav;
    interpolator_para_loa;

    elemento; // definido no desenha_forma()
    d3_ref;
    x_centro; // definidos pelo calcula_deslocamentos(), usado no move_para()
    x_direita;
    x_esquerda;

    cx;
    cy;

    bbox;

    constructor(nome, tipo, valor_loa, valor_reav, posicao_inicial_loa, posicao_inicial_reav, X0, forma_inicial = 'loa') {

        this.nome = nome;
        this.tipo = tipo;
        this.valor_loa = valor_loa;
        this.valor_reav = valor_reav;
        this.posicao_inicial_loa = posicao_inicial_loa;
        this.posicao_inicial_reav = posicao_inicial_reav;
        this.forma_inicial = forma_inicial;


        this.d_loa = this.gera_atributo_d_path(valor_loa, posicao_inicial_loa, X0);
        this.d_reav = this.gera_atributo_d_path(valor_reav, posicao_inicial_reav, X0);

        this.interpolator_para_reav = flubber.interpolate(this.d_loa,  this.d_reav);
        this.interpolator_para_loa  = flubber.interpolate(this.d_reav, this.d_loa);

        this.#desenha_forma(this.forma_inicial);
        this.#calcula_deslocamentos();
        this.cria_pattern();

    }

    // não posso deixar particular porque a classe derivada dessa precisa acessar esse método
    gera_atributo_d_path(qde, posicao_inicial, X0 = 0) {

        const grid = calcula_grid(qde, posicao_inicial);
        const subgrid = calcula_subgrid(grid);
        const lista_pontos = calcula_pontos_contorno_ordenados(subgrid);
        const d = calcula_atributo_d(lista_pontos, X0);

        return d;

        // definições das funções

        function calcula_grid(qde, n_inicial) {

            //const grid = v.grid.array;
            const grid = [];
    
            const ncol = chart.ncol;
    
            for (let n = n_inicial; n < qde + n_inicial; n++) {
    
                const j = Math.floor( n / ncol);
    
                const linha_impar = j % 2 != 0;
    
                const elemento = {
    
                    i : linha_impar ? ncol - 1 - n % ncol : n % ncol,
                    j : Math.floor( n / ncol),
                    impar : linha_impar,
                    index : n,
                    index_ : linha_impar ? 
                      n :
                      ( ncol * ( 2*j + 1) - 1) - n
    
                }
    
                grid.push(elemento);
    
            }
    
            //console.log(grid);
    
            return grid;
    
        }
    
        function calcula_subgrid(array) {
    
            const lista_pontos = [];
            const lista_segmentos = [];
            const lista_segmentos_internos = []; // os repetidos
    
            array.forEach(el => {
    
                const { i, j } = el;
    
                // pontos
    
                const pontos = [
                    `${i}, ${j}`,
                    `${i}, ${j+1}`,
                    `${i+1}, ${j}`,
                    `${i+1}, ${j+1}`
                ];
    
                pontos.forEach(p => {
    
                    if ( lista_pontos.indexOf(p) == -1 ) {
    
                        lista_pontos.push(p);
    
                    }
    
                })
    
                // segmentos
    
                const segmentos = [   
    
                    `${i}, ${j} / ${i+1}, ${j}`,
                    `${i+1}, ${j} / ${i+1}, ${j+1}`,
                    `${i}, ${j+1} / ${i+1}, ${j+1}`,
                    `${i}, ${j} / ${i}, ${j+1}`
    
                ];
    
                segmentos.forEach(s => {
    
                    if ( lista_segmentos.indexOf(s) === -1 ) {
    
                        lista_segmentos.push(s);
    
                    } else {
    
                        lista_segmentos_internos.push(s);
    
                    }
    
                })
    
            })
    
            return ({
    
                pontos              : lista_pontos,
                segmentos           : lista_segmentos,
                segmentos_a_excluir : lista_segmentos_internos
    
            })
    
        }

        function calcula_pontos_contorno_ordenados(dados_contorno) {

            const segmentos_totais = dados_contorno.segmentos;
            const segmentos_a_excluir = dados_contorno.segmentos_a_excluir;

            const segmentos = segmentos_totais.filter(segmento => segmentos_a_excluir.indexOf(segmento) == -1);
            // segmentos aqui está como algo assim: ['4, 1 / 5, 1', '4, 1 / 4, 2', ... ]
            // estão como texto para podermos filtrar

            const coords_segmentos = segmentos.map(segmento => segmento.split('/').map(d => d.trim()));
            // vai ficar assim: : [ ['4, 1', '5, 1'], ['4, 1', '4, 2'], ... ]

            // vamos começar pegando o primeiro segmento da lista
            let primeiro_segmento = coords_segmentos[0];

            // aí vamos manter uma lista dos segmentos que ainda não foram selecionados
            let segmentos_restantes = coords_segmentos.slice(1);

            let primeiro_ponto = primeiro_segmento[0];

            // vamos criar uma lista com os pontos na ordem, e incluuir esse primeiro ponto
            const pontos_ordenados = [];
            pontos_ordenados.push(primeiro_ponto);

            // e também o segundo ponto do primeiro segmento. 
            let proximo_ponto = primeiro_segmento[1];
            pontos_ordenados.push(proximo_ponto);

            let ctrl = 0;
            while (segmentos_restantes.length > 0 & ctrl < 10000) {

                // Esse vai ser o próximo ponto, então vamos procurar qual o segmento que o contém
                let proximo_segmento = segmentos_restantes.filter(s => s.includes(proximo_ponto))[0];
                // índice desse próximo segmento
                const indice_proximo_segmento = segmentos_restantes.indexOf(proximo_segmento)

                // o proximo ponto vai ser o outro ponto desse próximo segmento, e por aí vai.
                proximo_ponto = proximo_segmento.filter(d => d != proximo_ponto)[0];
                pontos_ordenados.push(proximo_ponto);

                //console.log(ctrl, segmentos_restantes.length, proximo_segmento, indice_proximo_segmento, proximo_ponto);
                ctrl++

                // mas antes precisamos excluir o segmento atual da lista
                segmentos_restantes.splice(indice_proximo_segmento, 1);

                //console.log([...segmentos_restantes]);

            }

            return pontos_ordenados

        }

        function calcula_atributo_d (pontos_ordenados, X0) {

            const { w, h, l, gap } = chart;
            //console.log(w,h,l,gap);

            const dist = gap / 2;

            let d = '';

            pontos_ordenados.forEach( (ponto, indice) => {

                const [i, j] = ponto.split(',').map(d => +d.trim());
                //console.log(ponto, i,j)

                const x = X0 + ( gap + (gap + l) * i ) - dist;
                const y = ( h - (gap + l) * ( j +1 ) ) + ( l + dist );

                const comando = indice == 0 ? 'M' : 'L';
                // para o primeiro elemento, movemos a 'caneta' até lá, com 'M'. Para os demais, desenhamos linhas até o pont, com 'L'.

                d += `${comando}${x},${y} `;
                
            })

            return d;

        }

    }

    #desenha_forma(path_inicial) { // 'loa' ou 'reav'

        let [atributo_d, nome, tipo] = [this['d_' + path_inicial], this.nome, this.tipo];

        const svg = chart.elemento;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.appendChild(path);

        path.setAttribute('d', atributo_d);
        path.classList.add('grande-numero');
        path.classList.add('escondido');

        //path.setAttribute('stroke', 'blue' );
        path.setAttribute('data-nome', nome);
        path.setAttribute('data-tipo', tipo);

        this.elemento = path;
        this.d3_ref = d3.select(path);

    }

    #calcula_deslocamentos() {

        if (this.elemento) {

            const path = this.elemento;

            const bbox = path.getBBox();
            this.bbox = bbox;

            const W = chart.ncol * (chart.gap + chart.l);//bbox.width;
            // pode acontecer de a forma não ocupar toda a largura disponível, e aí o width do bbox vai ficar "subestimado".
            console.log(W, 'a largura');

            const { w , h } = chart
            
            this.x_direita = w - W - 4;
            this.x_centro = ( w - W ) / 2;
            this.x_esquerda = 0;

            this.cx = bbox.x + bbox.width/2;
            this.cy = bbox.y + bbox.height/2;

        } else {

            console.log('primeiro crie a forma, Zé');

        }

    }

    cria_pattern() {

        const { l, gap } = chart;

        const svg = chart.elemento;

        const defs = svg.querySelector('defs');

        const pat = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        
        pat.setAttribute('x', gap/2);
        pat.setAttribute('y', gap/2);
        pat.setAttribute('width', gap/2 + l);
        pat.setAttribute('height', gap/2 + l);
        pat.setAttribute('patternUnits', 'userSpaceOnUse');
        pat.id = 'pattern-' + this.nome;

        const rect_pat = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        rect_pat.setAttribute('x', gap/2);
        rect_pat.setAttribute('y', gap/2);
        rect_pat.setAttribute('width', l);
        rect_pat.setAttribute('height', l);

        pat.appendChild(rect_pat);
        defs.appendChild(pat);

        this.elemento.setAttribute('fill', `url(#pattern-${this.nome})`);

    }

    move_para(onde) { // centro, esquerda, direita

        if (this.elemento) {

            const x = this['x_' + onde];

            this.elemento.style.transform = `translateX(${x}px)`;

        } else {

            console.log('Você nem desenhou ainda! Como quer mover?!');

        }

    }

    esconde(esconde = true) { // true, false

        if (esconde) this.elemento.classList.add('escondido');
        else this.elemento.classList.remove('escondido');

    }

    morfa_para(direcao) { // loa ou reav

        const interpolator = this['interpolator_para_' + direcao]

        this.d3_ref
          .transition()
          .delay(0)
          .duration(1000)
          .attrTween('d', () => interpolator)
        ;

    }

}

class GrandeReceita extends GrandeNumero {

    valor_liq_loa;
    valor_liq_reav;

    d_liq_loa;
    d_liq_reav;

    interpolator_para_liq_loa;


    constructor(nome, tipo, valor_loa, valor_reav, posicao_inicial_loa, posicao_inicial_reav, valor_liq_loa, valor_liq_reav, X0, forma_inicial) {

        super(nome, tipo, valor_loa, valor_reav, posicao_inicial_loa, posicao_inicial_reav, X0, forma_inicial = 'loa');

        this.valor_liq_loa = valor_liq_loa;
        this.valor_liq_reav = valor_liq_reav;

        this.d_liq_loa = this.gera_atributo_d_path(valor_liq_loa, posicao_inicial_loa, X0);
        this.d_liq_reav = this.gera_atributo_d_path(valor_liq_reav, posicao_inicial_reav, X0);

        // primeiro vou morfar do bruto loa para o liquido loa (com um método que vou criar aqui: morfa_para_liquido). 
        
        //aí só vou lidar com valores líquidos depois disso, de forma que os morfa_para() vão ser entre o valor liquido loa e o valor líquido reav.

        this.interpolator_para_liq_loa = flubber.interpolate(this.d_loa,  this.d_liq_loa);
        
        this.interpolator_para_reav = flubber.interpolate(this.d_liq_loa,  this.d_liq_reav);
        this.interpolator_para_loa  = flubber.interpolate(this.d_liq_reav, this.d_liq_loa);

    }

    morfa_para_liquido() { 

        const interpolator = this.interpolator_para_liq_loa;

        this.d3_ref
          .transition()
          .delay(0)
          .duration(1000)
          .attrTween('d', () => interpolator)
        ;

    }

}

class Forma extends GrandeNumero {

    r_loa;
    r_reav;
    forma_inicial;

    // parametros da simulacao
    x;
    x0;
    y;
    y0;

    constructor(nome, tipo, classificador, valor_loa, valor_reav, posicao_inicial_loa, posicao_inicial_reav, X0, forma_inicial) {

        super(nome, tipo, valor_loa, valor_reav, posicao_inicial_loa, posicao_inicial_reav, X0, forma_inicial = 'reav');

        this.elemento.setAttribute('data-classificador', classificador);
        this.elemento.classList.add('item');

        this.r_loa = scale_r(valor_loa);
        this.r_reav = scale_r(valor_reav);

        this.x = this.cx;
        this.x0 = this.cx;
        this.y = this.cy;
        this.y0 = this.cy;

    }

    morfa_para_circulo() {

        this.d3_ref
          .classed('bolha', true)
          .transition()
          .duration(2000)
          .attrTween('d', () => flubber.toCircle(
              this.d_reav, 
              this.cx, 
              this.cy, 
              this.r_reav, 

              {maxSegmentLength: 1}
            ))
        ;

    }

    morfa_para_forma() {

        this.d3_ref
        .classed('bolha', false)
          .transition()
          .duration(2000)
          .attrTween('d', () => flubber.fromCircle(
              this.cx, 
              this.cy, 
              this.r_reav, 
              this.d_reav, 
              {maxSegmentLength: 1}
            ))
      ;

    }

}

class Dados {

    file;
    raw;

    constructor(file) {
        this.file = file;
        this.read();
    }


    read() {

        fetch(this.file)
          .then(response => response.json())
          .then(data => {
              console.log(data);
              this.raw = data;
              this.init();

          })

    }

    init() {

        this.monta_grandes_numeros();

        GN.despesa.move_para('direita');
        GN.resultado.move_para('centro');

    }

    monta_grandes_numeros() {

        const grandes_numeros = Object.keys(GN);

        grandes_numeros.forEach(nome => {

            const d = this.raw.grandes_numeros[nome];

            console.log(nome, d);

            GN[nome] = nome == "receita" ?

              new GrandeReceita(
                  nome = nome,
                  d.categoria,
                  d.bruta.loa,
                  d.bruta.reav,
                  d.posicao_inicial_loa,
                  d.posicao_inicial_reav,
                  d.liquida.loa,
                  d.liquida.reav,
                  0
              ) 
              
              :

              new GrandeNumero(
                  nome,
                  d.categoria,
                  d.loa,
                  d.reav,
                  d.posicao_inicial_loa,
                  d.posicao_inicial_reav,
                  0
              )
            ;

        })

        console.log('done');

    }

}

const GN = {
    despesa : null,
    receita : null,
    transferencias : null,
    resultado : null
}

const dados = new Dados('output.json');

// inicio
const max_valor = 2118;
const chart = new Chart(max_valor);



// Constroi grandes numeros




const maior_valor = 778;

const scale_r = d3.scaleSqrt()
  .domain([0, maior_valor])
  .range([1, 30])
;


/*
const desp = new GrandeNumero('despesa', 'despesa', 1720, 1753, 0, 0, 0);
const rec = new GrandeReceita('receita', 'receita', 2031, 2118, 0, 0, 1644, 1686, 0);

const X0 = desp.x_direita;

//const rec_liquida = new GrandeNumero('receita-liquida', 'receita', 1644, 1686, 0);
const transf = new GrandeNumero('transferencias', 'receita', 387, 431, 1644, 1686, 0);

const resultado = new GrandeNumero('resultado', 'resultado', 76, 67, 1644, 1686, 0);

const prev = new Forma('Benefícios Previdenciários', 'item-despesa', 'Despesas Obrigatórias', 778, 778, 0, 0, X0);

const desp_pf = new Forma('Despesas do Poder Executivo Sujeitas à Programação Financeira', 'item-despesa', 'Despesas Obrigatórias', 354, 354, 778, X0);

const pessoal = new Forma('Pessoal e Encargos Sociais', 'item-despesa', 'Despesas Obrigatórias', 336, 339, 778 + 354, 778 + 354, X0);

const bpc = new Forma('Benefícios  de Prestação Continuada', 'item-despesa', 'Despesas Obrigatórias', 76, 76, 778 + 354 + 339, 778 + 354 + 339, X0);

const abono = new Forma('Abono e Seguro Desemprego', 'item-despesa', 'Despesas Obrigatórias', 66, 64, 778 + 354 + 339 + 76, 778 + 354 + 339 + 76, X0);

const itens = [prev, desp_pf, pessoal, bpc, abono];

let delay = 5000;

*/

console.log('pode começar');

class MenuControle {

    ref;
    elemento;
    nome_data_attr;

    constructor(ref, nome_data_attr) {

        this.ref = ref;
        this.nome_data_attr = nome_data_attr;
        this.elemento = document.querySelector(ref);
        this.monitora();

    }

    monitora() {
        this.elemento.addEventListener('click', e => this.atua(e, this.nome_data_attr));
    }

    atua (e, nome_data_attr) {

        if (e.target.tagName != 'BUTTON') {
            console.log('nào é botão');
            return
        }

        else {

            const acao = e.target.dataset[nome_data_attr];
            console.log(acao);
            acoes[acao]();        
        }

    }

}

const acoes = {

    'rec' : () => {
        GN.receita.esconde(false);
    },

    'transf' : () => {
        GN.transferencias.esconde(false);
    },

    'rec-liq' : () => {
        GN.receita.morfa_para_liquido();
        setTimeout(() => GN.transferencias.esconde(true), 1000);
    },

    'rec-desp' : () => {
        GN.despesa.esconde(false);
    },

    'resultado' : () => {
        GN.despesa.move_para('centro');
        GN.receita.move_para('centro');
        setTimeout(() => GN.resultado.esconde(false), 1000);
    },

    'reav' : () => {
        GN.despesa.move_para('direita');
        GN.receita.move_para('esquerda');
        GN.resultado.esconde(true);
        setTimeout(() => GN.receita.morfa_para('reav'), 2000);
        setTimeout(() => GN.despesa.morfa_para('reav'), 4000);
        setTimeout(() => {

            GN.despesa.move_para('centro');
            GN.receita.move_para('centro');
            GN.resultado.morfa_para('reav');

        }, 6000);
        setTimeout(() => {

            GN.despesa.move_para('centro');
            GN.receita.move_para('centro');
            GN.resultado.esconde(false);

        }, 8000);

    }


}

// init
const menu_controle = new MenuControle('.controle', 'acao');


//itens.forEach(item => item.esconde(false))

/*setTimeout(itens.forEach(item => item.morfa_para_circulo()), 8000);*/



// simulation

/*

const strength = 0.04;

let flag = false;

const sim = d3.forceSimulation()
  .velocityDecay(0.2)
  .force('x', d3.forceX().strength(strength).x(500))
  .force('y', d3.forceY().strength(strength).y(300))
  .force('collision', d3.forceCollide().strength(strength*2).radius(d => d.r_reav + 2))
  .alphaMin(0.2)
  .on('tick', () => {

    itens.forEach(item => {
        item.elemento.style.transform = `translate(${item.x - item.x0}px, ${item.y - item.y0}px)`;
    })

  })
  .stop()
;

sim.nodes(itens);*/
