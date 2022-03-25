const v = {

    control : {

        init : () => {

            v.refs.set();
            v.sizings.get();
            v.grid.calcula_parametros();
            v.grid.desenha_grid();

        }

    },

    params : {

        fixos: {

            l : 30,
            gap : 6,
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

        }


    },

    grid : {

        calcula_parametros : () => {

            const { w, h } = v.sizings.valores;
            const { l, gap } = v.params.fixos;

            const ncol = Math.floor( ( w - gap ) / ( l + gap ) );

            v.params.calculados.ncol = ncol;

            const nrow = ncol;

            console.log(ncol, ncol * (l+gap) + gap);

        },

        desenha_grid : () => {

            const grid = [];

            const ncol = v.params.calculados.ncol;

            for (let n = 0; n < v.params.fixos.qde; n++) {

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

            console.log(grid);


        }

    }

}

v.control.init();