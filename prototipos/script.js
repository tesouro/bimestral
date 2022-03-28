const v = {

    control : {

        init : () => {

            v.refs.set();
            v.sizings.get();
            v.grid.calcula_parametros();
            v.sizings.resize();

            const grid1 = v.grid.calcula_grid(13, 0);
            const grid2 = v.grid.calcula_grid(20, 13+0);
            const grid3 = v.grid.calcula_grid(30, 20+13);

            v.grid.desenha_grid(grid1, 'pink');
            v.grid.desenha_grid(grid2, 'khaki');
            v.grid.desenha_grid(grid3, 'dodgerblue');

            const result = v.contornos.calcula_subgrid(grid2);

            console.log(result);

            v.contornos.desenha_segmentos(result, 'segmentos');
            //v.contornos.desenha_segmentos(result, 'segmentos_a_excluir');
            //v.contornos.desenha_contorno(result);
            v.contornos.desenha_contorno_path(result);
            v.contornos.desenha_pontos(result);

        }

    },

    params : {

        fixos: {

            l : 30,
            gap : 10,
            qde : 100

        },

        calculados : {

            ncol : null,
            nrow : null

        }

    },

    refs : {

        lista : [

            {
                nome: 'svg',
                ref : 'svg',
                multiplo: false
            }


        ],

        svg : null,

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

        array : [],

        calcula_parametros : () => {

            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            const ncol = Math.floor( ( w - gap ) / ( l + gap ) );

            v.params.calculados.ncol = ncol;

            const nrow = ncol;

            console.log(ncol, ncol * (l+gap) + gap);

        },

        calcula_grid : (qde, n_inicial) => {

            //const grid = v.grid.array;
            const grid = [];

            const ncol = v.params.calculados.ncol;

            for (let n = n_inicial; n < qde + n_inicial; n++) {

                const j = Math.floor( n / ncol);

                const linha_impar = j % 2 != 0;

                const elemento = {

                    i : n % ncol,
                    j : Math.floor( n / ncol),
                    impar : linha_impar,
                    index : n,
                    index_ : linha_impar ? 
                      n :
                      ( ncol * ( 2*j + 1) - 1) - n

                }

                grid.push(elemento);

            }

            return grid;

            //console.log(grid);


        },

        desenha_grid : (array, cor) => {

            const svg = v.refs.svg;
            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            array.forEach(el => {

                const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

                const { i, j, impar, index, index_ } = el;

                //svg.preprend(cell);
                svg.appendChild(cell);

                cell.setAttribute('x', gap + (gap + l) * i );
                cell.setAttribute('y', h - (gap + l) * ( j +1 ) );
                cell.setAttribute('width', l);
                cell.setAttribute('height', l);
                cell.setAttribute('fill', cor);


            })

        }

    },

    contornos : {

        calcula_subgrid : (array) => {

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

        },

        desenha_pontos : (dados_contorno) => {

            const pontos = dados_contorno.pontos;

            const svg = v.refs.svg;
            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            pontos.forEach(p => {

                //recupera as coordenadas

                const [i, j] = p.split(',').map(value => +value);

                //console.log(p, i, j);

                const x = ( gap + (gap + l) * i ) - gap / 2;
                const y = ( h - (gap + l) * ( j +1 ) ) + ( l + gap/2 );

                const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

                //svg.preprend(cell);
                svg.appendChild(point);

                point.setAttribute('cx', x );
                point.setAttribute('cy', y );
                point.setAttribute('r', 2);
                point.setAttribute('fill', '#333');


            });

        },

        desenha_segmentos : (dados_contorno, tipo) => {

            const segmentos = dados_contorno[tipo];

            const svg = v.refs.svg;
            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            segmentos.forEach(s => {

                //recupera os pontos

                const [p1, p2] = s.split('/');

                console.log(s, p1, p2);

                const points = [p1, p2];

                const coords = [
                    
                    {
                        x : null,
                        y : null
                    },

                    {
                        x : null,
                        y : null
                    }

                ];

                points.forEach( (p,p_i) => {

                    const [i, j] = p.split(',').map(value => +value);

                    coords[p_i].x = ( gap + (gap + l) * i ) - gap / 2;
                    coords[p_i].y = ( h - (gap + l) * ( j +1 ) ) + ( l + gap/2 );

                })

                //agora vou ter: coords = [ {x1,y1}, {x2,y2} ]

                console.log(coords);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                //svg.preprend(cell);
                svg.appendChild(line);

                line.setAttribute('x1', coords[0].x );
                line.setAttribute('y1', coords[0].y );

                line.setAttribute('x2', coords[1].x );
                line.setAttribute('y2', coords[1].y );

                line.setAttribute('stroke', tipo == 'segmentos' ? 'forestgreen' : 'red' );

            });

        },

        desenha_contorno : (dados_contorno) => {

            const segmentos_totais = dados_contorno.segmentos;
            const segmentos_a_excluir = dados_contorno.segmentos_a_excluir;

            const segmentos = segmentos_totais.filter(segmento => segmentos_a_excluir.indexOf(segmento) == -1);

            const svg = v.refs.svg;
            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            segmentos.forEach(s => {

                //recupera os pontos

                const [p1, p2] = s.split('/');

                console.log(s, p1, p2);

                const points = [p1, p2];

                const coords = [
                    
                    {
                        x : null,
                        y : null
                    },

                    {
                        x : null,
                        y : null
                    }

                ];

                points.forEach( (p,p_i) => {

                    const [i, j] = p.split(',').map(value => +value);

                    coords[p_i].x = ( gap + (gap + l) * i ) - gap / 2;
                    coords[p_i].y = ( h - (gap + l) * ( j +1 ) ) + ( l + gap/2 );

                })

                //agora vou ter: coords = [ {x1,y1}, {x2,y2} ]

                console.log(coords);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                //svg.preprend(cell);
                svg.appendChild(line);

                line.setAttribute('x1', coords[0].x );
                line.setAttribute('y1', coords[0].y );

                line.setAttribute('x2', coords[1].x );
                line.setAttribute('y2', coords[1].y );

                line.setAttribute('stroke', 'goldenrod' );

            });

        },

        desenha_contorno_path : (dados_contorno) => {

            const segmentos_totais = dados_contorno.segmentos;
            const segmentos_a_excluir = dados_contorno.segmentos_a_excluir;

            const segmentos = segmentos_totais.filter(segmento => segmentos_a_excluir.indexOf(segmento) == -1);

            let d = '';

            const svg = v.refs.svg;
            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            segmentos.forEach(s => {

                //recupera os pontos

                const [p1, p2] = s.split('/');

                console.log(s, p1, p2);

                const points = [p1, p2];

                const coords = [
                    
                    {
                        x : null,
                        y : null
                    },

                    {
                        x : null,
                        y : null
                    }

                ];

                points.forEach( (p,p_i) => {

                    const [i, j] = p.split(',').map(value => +value);

                    coords[p_i].x = ( gap + (gap + l) * i ) - gap / 2;
                    coords[p_i].y = ( h - (gap + l) * ( j +1 ) ) + ( l + gap/2 );

                })

                //agora vou ter: coords = [ {x1,y1}, {x2,y2} ]

                d += `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y} `


            });

            d += 'Z';

            console.log(d);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            svg.appendChild(path);

            path.setAttribute('d', d );
            path.setAttribute('stroke', 'goldenrod' );


        }

    }

}

v.control.init();