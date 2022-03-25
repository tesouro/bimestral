const v = {

    control : {

        init : () => {

            v.refs.set();
            v.sizings.get();

        }

    },

    params : {

        fixos: {

            l : 30,
            gap : 6

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


    }

}

v.control.init();