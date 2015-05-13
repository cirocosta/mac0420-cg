# mac0420-cg - EP2

> Autores: Ciro S. Costa, Aline Borges

## Quick Run

Para rodar a aplicação basta iniciar um servidor local na raíz do projeto e então direcionar-se para o caminho `http://localhost:PORTA/demos/8-lib-obj-parser`.

## Desenvolvendo

A atual implementação utiliza ES6 (http://en.wikipedia.org/wiki/ECMAScript#Harmony.2C_6th_Edition) a qual nos provê módulos e outros artefatos para uma implementação mais próximo àquilo de nosso costume (orientação a objetos e não por protótipos). Para um build completo é necessário que se tenha instalado NodeJS 10.x+.

Nota: **NÂO é necessário build completo para a execução do programa. Sua versão compilada se apresenta em /dist pronta para uso direto no browser**.

```sh
$ npm install
$ npm build
$ http-server  #(ou python -m 'SimpleHTTPServer'...)
```

## Acertos

Ficamos muito contentes com a execução do trabalho. Foi possível destrinchar muito bem um modo de organização em módulos dos componentes de uma pequena 'engine' após muito trabalho e busca com relação a isto. Tendo refeito duas vezes, acreditamos ter encontrado uma boa estrutura.

Para a implementação nos baseamos em alguns recursos extras:

- [Ray-Box Intersection](http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm)
- [Mouse Picking](http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/MousePicking)
- [ArcBall Rotation](http://nehe.gamedev.net/tutorial/arcball_rotation/19003/)


## Complicações

Durante a realização do EP2 diversos problemas surgiram, tais como controle de câmera, instanciação de mais de 3 objetos (entender definitivamente como controlar os buffers) e lançamento de raio para teste de intersecção. Muito tempo foi despendido a este último por conta de problemas com as matrizes de projeção e visualização (ainda assim não tendo chegado a um resultado bom :( ).

Problemas:

- Ocorreu algum problema com o `bind` da tecla 'x' na implementação utilizada então todas as transformações e delete não funcionam para o mesmo (não deu tempo de trocar para outra tecla ... bobeira nossa
- O teste de intersecção está com algum problema quando rotacionamos a camera ou trocamos muito o posicionamento dos objetos
- As transformações estão sendo feitas para todos os objetos
- Não estamos destacando o objeto cuja intersecção é feita.

