/* vec4 mat_ambient = vec4(1.0, 1.0, 1.0, 1.0); */
/* vec4 mat_diffuse = vec4(1.0, 1.0, 1.0, 1.0); */
/* vec4 mat_specular = vec4(1.0, 1.0, 1.0, 1.0); */

/* vec4 lightPosition = vec4(0.0, 0.0, 10.0, 0.0); */
/* vec4 lightAmbient = vec4(0.2, 0.2, 0.2, 1.0); */
/* vec4 lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0); */
/* vec4 lightSpecular = vec4(1.0, 1.0, 1.0, 1.0); */

/* float shininess = 100.0; */

/* vec4 ambient = lightAmbient * mat_ambient; */

attribute vec4 a_Normal;
attribute vec4 a_Position;

uniform mat4 u_NormalMatrix;    // (M^{-1})^T
uniform mat4 u_ModelMatrix;     // ModelMatrix
uniform mat4 u_MvpMatrix;       // model-view-projection matrix

varying vec4 v_Color;

void
main()
{
  gl_Position = u_MvpMatrix * a_Position;
}
