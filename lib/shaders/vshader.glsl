attribute vec4 a_Position;
attribute vec4 a_Normal;

vec4 mat_ambient = vec4(1.0, 1.0, 1.0, 1.0);
vec4 mat_diffuse = vec4(1.0, 1.0, 1.0, 1.0);
vec4 mat_specular = vec4(1.0, 1.0, 1.0, 1.0);

vec4 lightPosition = vec4(0.0, 0.0, 10.0, 0.0);
vec4 lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
vec4 lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
vec4 lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
float shininess = 100.0;

vec4 ambient = lightAmbient * mat_ambient;

uniform mat4 u_NormalMatrix;    // (M^{-1})^T
uniform mat4 u_ModelMatrix;     // ModelMatrix
uniform mat4 u_MvpMatrix;       // model-view-projection matrix

varying vec4 v_Color;

void
main()
{
  vec4 pos = -(u_ModelMatrix * a_Position); // world coordinate
  vec4 L = normalize(lightPosition - vec4(pos));
  vec4 V = normalize(pos);
  vec4 H = normalize(L + V);
  vec4 N = normalize(vec4(u_NormalMatrix * a_Normal));

  float Kd = max(dot(N,L), 0.0);
  vec4 diffuse = Kd * lightDiffuse * mat_diffuse;

  float Ks = pow(max(dot(N,H), 0.0), shininess);
  vec4 specular = Ks * lightSpecular * mat_specular;

  v_Color = vec4(ambient + diffuse + specular);
  gl_Position = u_MvpMatrix * a_Position;
}
