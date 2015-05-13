attribute vec4 a_Position;
attribute vec4 a_Normal;

uniform mat4 u_NormalMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_MvpMatrix;

varying vec4 v_Normal;
varying vec4 v_Position;

void main ()
{
  gl_Position = u_MvpMatrix * a_Position;

  v_Position = vec4(u_ModelMatrix * a_Position);
  v_Normal = normalize(vec4(u_NormalMatrix * a_Normal));
}
