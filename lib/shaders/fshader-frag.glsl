precision mediump float;

vec4 mat_ambient = vec4(1.0, 0.7, 0.2, 0.5);
vec4 mat_diffuse = vec4(1.0, 1.0, 1.0, 1.0);
vec4 mat_specular = vec4(1.0, 1.0, 1.0, 1.0);

vec4 lightPosition = vec4(0.0, 3.0, 2.0, 0.0);
vec4 lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
vec4 lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
vec4 lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
float shininess = 100.0;

vec4 ambient = lightAmbient * mat_ambient;

varying vec4 v_Normal;
varying vec4 v_Position;

void main ()
{
  vec4 L = normalize(lightPosition - vec4(v_Position));
  vec4 V = normalize(v_Position);
  vec4 H = normalize(L + V);

  float Kd = max(dot(v_Normal,L), 0.0);
  vec4 diffuse = Kd * lightDiffuse * mat_diffuse;

  float Ks = pow(max(dot(v_Normal,H), 0.0), shininess);
  vec4 specular = Ks * lightSpecular * mat_specular;

  gl_FragColor = vec4(ambient + diffuse + specular);
}

