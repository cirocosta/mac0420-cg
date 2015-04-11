# EP1 - Parser e Visualizar .OBJ

> Visualize arquivos .OBJ diretamente no browser.

## Uso

Abra o arquivo `index.html` em um browser compatível com WebGL (veja: http://caniuse.com/#search=webgl) e então carregue um arquivo `.obj` que deseje visualizar. Note que o mesmo não é necessário que o mesmo contenha as normais calculadas ou que o número de vértices definidos para cada vértice seja 3 (quads são aceitos e então convertidos).

Note que não há a necessidade de iniciar um servidor para a visualização já que a implementação utiliza apenas leitura local de arquivos (e não requests externos).

## Segunda Implementação

Antes da implementação visando preencher os requisitos do EP decidi fazer do zero uma implementação de um leitor utilizando [ES6](http://en.wikipedia.org/wiki/ECMAScript#ECMAScript_Harmony_.286th_Edition.29) (nova especificação do javascript) e uma biblioteca mais otimizada para o tratamento das operações matriciais ([gl-matrix](https://github.com/toji/gl-matrix)). O código da tal está aberto e pode ser visualizado em [http://cirocosta.github.io/mac0420-cg/demos/4-obj-reader/](http://cirocosta.github.io/mac0420-cg/demos/4-obj-reader/)
