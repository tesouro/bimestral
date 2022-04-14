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

            v.sizings.valores.w = +window.getComputedStyle(svg).width.slice(0,-2);
            v.sizings.valores.h = +window.getComputedStyle(svg).height.slice(0,-2);

            console.log(v.sizings.valores);

        },

        resize : () => {

            const ncol = v.params.calculados.ncol;
            const { l, gap } = v.params.fixos;

            const new_w = ncol * ( gap + l ) + gap;

            v.sizings.valores.w = new_w;

            v.sizings.valores.h = new_w;

            const svg = v.refs.svg;

            svg.style.width = new_w + 'px';
            svg.style.height = new_w + 'px';

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

v.control.init();

class Chart {

    lista = [

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


    ]

    constructor() {
        this.set_refs();

    }


    set_refs() {

        const nomes = this.lista;

        nomes.forEach(ref => {

            this.lista[ref.nome] = ref.multiplo ?
              document.querySelectorAll(ref.ref) :
              document.querySelector(ref.ref)
            ;

        })

    }
    
}

class GrandeNumero {

    nome;
    tipo;
    valor_loa;
    valor_reav;
    tamanho;
    posicao_inicial;
    X0;
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

    constructor(nome, tipo, valor_loa, valor_reav, posicao_inicial, X0, forma_inicial = 'loa') {

        this.nome = nome;
        this.tipo = tipo;
        this.valor_loa = valor_loa;
        this.valor_reav = valor_reav;
        this.posicao_inicial = posicao_inicial;
        this.forma_inicial = forma_inicial;


        this.d_loa = this.gera_atributo_d_path(valor_loa, posicao_inicial, X0);
        this.d_reav = this.gera_atributo_d_path(valor_reav, posicao_inicial, X0);

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
    
            const ncol = v.params.calculados.ncol;
    
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

            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

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

        const svg = v.refs.svg;
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

            const bbox = path.getBBox()

            const W = bbox.width;

            const { w , h } = v.sizings.valores;
            
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

        const { l, gap } = v.params.fixos;

        const svg = v.refs.svg;

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
          .delay(2000)
          .duration(2000)
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


    constructor(nome, tipo, valor_loa, valor_reav, posicao_inicial, valor_liq_loa, valor_liq_reav, X0, forma_inicial) {

        super(nome, tipo, valor_loa, valor_reav, posicao_inicial, X0, forma_inicial = 'loa');

        this.valor_liq_loa = valor_liq_loa;
        this.valor_liq_reav = valor_liq_reav;

        this.d_liq_loa = this.gera_atributo_d_path(valor_liq_loa, posicao_inicial, X0);
        this.d_liq_reav = this.gera_atributo_d_path(valor_liq_reav, posicao_inicial, X0);

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
          .delay(2000)
          .duration(2000)
          .attrTween('d', () => interpolator)
        ;

    }

}

class Forma extends GrandeNumero {

    r_loa;
    r_reav;
    forma_inicial;

    constructor(nome, tipo, classificador, valor_loa, valor_reav, posicao_inicial, X0, forma_inicial) {

        super(nome, tipo, valor_loa, valor_reav, posicao_inicial, X0, forma_inicial = 'reav');

        this.elemento.setAttribute('data-classificador', classificador);
        this.elemento.classList.add('item');

        this.r_loa = scale_r(valor_loa);
        this.r_reav = scale_r(valor_reav);

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



const maior_valor = 778;

const scale_r = d3.scaleSqrt()
  .domain([0, maior_valor])
  .range([1, 30])
;



const desp = new GrandeNumero('despesa', 'despesa', 1720, 1753, 0, 0);
const rec = new GrandeReceita('receita', 'receita', 2031, 2118, 0, 1644, 1686, 0);

const X0 = desp.x_direita;

//const rec_liquida = new GrandeNumero('receita-liquida', 'receita', 1644, 1686, 0);
const transf = new GrandeNumero('transferencias', 'receita', 387, 431, 1644, 0);

const resultado = new GrandeNumero('resultado', 'resultado', 76, 67, 1644, 0);

const prev = new Forma('Benefícios Previdenciários', 'item-despesa', 'Despesas Obrigatórias', 778, 778, 0, X0);

const pessoal = new Forma('Pessoal e Encargos Sociais', 'item-despesa', 'Despesas Obrigatórias', 336, 339, 778, X0);

const abono = new Forma('Abono e Seguro Desemprego', 'item-despesa', 'Despesas Obrigatórias', 66, 64, 778+339, X0);

