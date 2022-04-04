const v = {

    control : {

        init : () => {

            v.refs.set();
            v.sizings.get();
            v.grid.calcula_parametros();
            v.sizings.resize();

            v.params.set_css();

            const grid1 = v.grid.calcula_grid(190, 0);
            const grid2 = v.grid.calcula_grid(45, 190+0);
            //const grid3 = v.grid.calcula_grid(6, 10+13);

            v.grid.desenha_grid(grid1, 'pink');
            v.grid.desenha_grid(grid2, 'khaki');
            //v.grid.desenha_grid(grid3, 'dodgerblue');

            const result = v.contornos.calcula_subgrid(grid1);
            const result2 = v.contornos.calcula_subgrid(grid2);

            //console.log(result);

            //v.contornos.desenha_segmentos(result, 'segmentos');
            //v.contornos.desenha_segmentos(result, 'segmentos_a_excluir');
            //v.contornos.desenha_contorno(result);
            //v.contornos.desenha_contorno_path(result);
            //v.contornos.desenha_pontos(result);

            const lista_pontos = v.contornos.calcula_pontos_contorno_ordenados(result);
            const path = v.contornos.calcula_path(lista_pontos);
            console.log(path);
            v.contornos.desenha_path(path, 'desp');

            const lista_pontos2 = v.contornos.calcula_pontos_contorno_ordenados(result2);
            const path2 = v.contornos.calcula_path(lista_pontos2);
            console.log(path2);
            v.contornos.desenha_path(path2, 'desp2');

            v.contornos.update_dimensoes_pattern();

            //v.bolhas.converte_para_bolhas('desp');

        }

    },

    params : {

        fixos: {

            l : 20,
            gap : 4,
            qde : 2000

        },

        calculados : {

            ncol : null,
            nrow : null

        },

        set_css : () => {

            const params = v.params.fixos;

            const variaveis = ['l', 'gap'];

            variaveis.forEach(variavel => {
                
                document.documentElement.style.setProperty(`--${variavel}`, params[variavel] + 'px');

            })

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

            //console.log(ncol, ncol * (l+gap) + gap);

        },

        calcula_grid : (qde, n_inicial) => {

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

            console.log(grid);

            return grid;

            


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

                const x = ( gap + (gap + l) * i ) - gap/2;
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

                //console.log(coords);

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

        calcula_pontos_contorno_ordenados : (dados_contorno) => {

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

        },

        calcula_path : (pontos_ordenados) => {

            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            const dist = gap / 2;

            let d = '';

            console.log(pontos_ordenados);


            pontos_ordenados.forEach( (ponto, indice) => {

                const [i, j] = ponto.split(',').map(d => +d.trim());
                console.log(ponto, i,j)

                const x = ( gap + (gap + l) * i ) - dist;
                const y = ( h - (gap + l) * ( j +1 ) ) + ( l + dist );

                const comando = indice == 0 ? 'M' : 'L';
                // para o primeiro elemento, movemos a 'caneta' até lá, com 'M'. Para os demais, desenhamos linhas até o pont, com 'L'.

                d += `${comando}${x},${y} `;
                
            })

            return d;

        },

        desenha_path : (d, id) => {

            const svg = v.refs.svg;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            svg.appendChild(path);

            path.setAttribute('d', d );
            //path.setAttribute('stroke', 'blue' );
            path.setAttribute('data-id', id);

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

                //console.log(s, p1, p2);

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

                //console.log(s, p1, p2);

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

            //console.log(d);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            svg.appendChild(path);

            path.setAttribute('d', d );
            path.setAttribute('stroke', 'goldenrod' );


        },

        update_dimensoes_pattern : () => {

            const pat = document.querySelector('#Pattern');
            const rect_pat = document.querySelector('#Pattern >  rect');

            const { l, gap } = v.params.fixos;

            pat.setAttribute('x', gap/2);
            pat.setAttribute('y', gap/2);
            pat.setAttribute('width', gap + l);
            pat.setAttribute('height', gap + l);

            rect_pat.setAttribute('x', gap/2);
            rect_pat.setAttribute('y', gap/2);
            rect_pat.setAttribute('width', l);
            rect_pat.setAttribute('height', l);

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