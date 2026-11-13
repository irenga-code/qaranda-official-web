(function(){
var de=document.documentElement,LOW=de.classList.contains("lite")||window.innerWidth<860,gl=false;
if(de.classList.contains("lite"))return;
try{var tc=document.createElement("canvas");gl=!!(tc.getContext("webgl")||tc.getContext("experimental-webgl"))}catch(e){}
if(!gl)return;
var loading=null;
function loadThree(){if(window.THREE)return Promise.resolve();if(loading)return loading;loading=new Promise(function(res,rej){var sc=document.createElement("script");sc.async=true;sc.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";sc.onload=res;sc.onerror=function(){loading=null;rej()};document.head.appendChild(sc)});return loading}
Array.prototype.forEach.call(document.querySelectorAll(".globe"),function(host){
function start(){
try{
var T=THREE,renderer=new T.WebGLRenderer({antialias:!LOW,alpha:true,powerPreference:"low-power"});
renderer.setPixelRatio(LOW?1:Math.min(window.devicePixelRatio||1,2));
var cv=renderer.domElement;cv.style.cssText="position:absolute;left:-30%;top:-30%;width:160%;height:160%;display:block;z-index:-1;pointer-events:none";
var scene=new T.Scene(),cam=new T.PerspectiveCamera(30,1,.1,50);cam.position.z=7.55;
function size(){var w=host.clientWidth||300;renderer.setSize(w*1.6,w*1.6,false)}
size();window.addEventListener("resize",size);
var L=new T.TextureLoader(),cnt=0,day,night;
function ready(){if(++cnt===2)build()}
day=L.load(host.getAttribute("data-day"),ready);night=L.load(host.getAttribute("data-night"),ready);
function build(){
var an=renderer.capabilities.getMaxAnisotropy();day.anisotropy=an;night.anisotropy=an;
var vs="varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
var fs=["uniform sampler2D dayTex;uniform sampler2D nightTex;uniform vec3 sun;varying vec2 vUv;varying vec3 vN;",
"void main(){vec3 n=normalize(vN);float l=dot(n,sun);float d=smoothstep(-0.1,0.3,l);",
"vec3 dc=texture2D(dayTex,vUv).rgb;dc=pow(dc,vec3(.82))*1.3;",
"vec3 nl=texture2D(nightTex,vUv).rgb;float lum=dot(nl,vec3(.299,.587,.114));",
"vec3 lights=vec3(1.,.8,.48)*smoothstep(.2,.55,lum)*1.5;",
"vec3 col=dc*(.035+d*.965)+lights*(1.-d);",
"float f=pow(1.-max(n.z,0.),2.6);col+=vec3(.3,.55,1.)*f*(.12+.9*d);",
"gl_FragColor=vec4(col,1.);}"].join("");
var earth=new T.Mesh(new T.SphereGeometry(1,LOW?48:96,LOW?48:96),new T.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:{dayTex:{value:day},nightTex:{value:night},sun:{value:new T.Vector3(-1,.12,.25).normalize()}}}));
var afs="varying vec3 vN;void main(){vec3 n=normalize(vN);float i=pow(max(0.,.55-dot(n,vec3(0.,0.,1.))),3.)*.7;float s=.12+.88*smoothstep(.5,-.4,n.x);gl_FragColor=vec4(vec3(.35,.6,1.)*i*s,min(i*s,1.));}";
var atm=new T.Mesh(new T.SphereGeometry(1.1,64,64),new T.ShaderMaterial({vertexShader:vs,fragmentShader:afs,side:T.BackSide,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
var g=new T.Group();g.rotation.x=.32;g.rotation.z=.18;g.add(earth);scene.add(g);scene.add(atm);
earth.rotation.y=4.15;
var N=LOW?220:560,pos=new Float32Array(N*3),sz=new Float32Array(N),ph=new Float32Array(N),al=new Float32Array(N),bl=new Float32Array(N),tn=Math.tan(15*Math.PI/180),i;
for(i=0;i<N;i++){var zz=-(1.5+Math.random()*8),hh=(cam.position.z-zz)*tn;pos[i*3]=(Math.random()*2-1)*hh;pos[i*3+1]=(Math.random()*2-1)*hh;pos[i*3+2]=zz;sz[i]=1.6+Math.random()*1.8;ph[i]=Math.random()*6.283;al[i]=.3+Math.random()*.4;bl[i]=Math.random()}
var sg=new T.BufferGeometry();sg.setAttribute("position",new T.BufferAttribute(pos,3));sg.setAttribute("size",new T.BufferAttribute(sz,1));sg.setAttribute("ph",new T.BufferAttribute(ph,1));sg.setAttribute("al",new T.BufferAttribute(al,1));sg.setAttribute("bl",new T.BufferAttribute(bl,1));
var sm=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},pr:{value:renderer.getPixelRatio()}},vertexShader:"attribute float size;attribute float ph;attribute float al;attribute float bl;uniform float time;uniform float pr;varying float vA;varying float vB;void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);vec2 n=p.xy/p.w;float tw=.65+.35*sin(time*(.6+bl*1.4)+ph);vA=al*tw*smoothstep(1.,.6,length(n));vB=bl;gl_PointSize=size*pr;gl_Position=p;}",fragmentShader:"varying float vA;varying float vB;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d)*vA;vec3 c=mix(vec3(1.),vec3(.72,.82,1.),vB);gl_FragColor=vec4(c,a);}"});
scene.add(new T.Points(sg,sm));
host.appendChild(cv);host.classList.add("live");
var drag=false,px=0,py=0;host.style.touchAction="pan-y";host.style.cursor="grab";
host.addEventListener("pointerdown",function(e){drag=true;px=e.clientX;py=e.clientY;try{host.setPointerCapture(e.pointerId)}catch(x){}});
host.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;earth.rotation.y+=dx*.008;g.rotation.x=Math.max(-.6,Math.min(.9,g.rotation.x+dy*.004));if(!run)renderer.render(scene,cam)});
["pointerup","pointercancel","pointerleave"].forEach(function(ev){host.addEventListener(ev,function(){drag=false})});
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches,last=0,raf=0,run=false;
function frame(t){if(!run)return;var dt=last?Math.min((t-last)/1000,.1):0;last=t;earth.rotation.y+=dt*.045;sm.uniforms.time.value=t/1000;renderer.render(scene,cam);raf=requestAnimationFrame(frame)}
renderer.render(scene,cam);
if(reduce)return;
function go(){if(!run){run=true;last=0;raf=requestAnimationFrame(frame)}}
function halt(){run=false;cancelAnimationFrame(raf)}
var vis=true;function sync(){vis&&!document.hidden?go():halt()}
if("IntersectionObserver" in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting;sync()}).observe(host)}else go();
document.addEventListener("visibilitychange",sync);
}
}catch(e){}
}
function boot(){loadThree().then(start,function(){})}
if(host.offsetParent!==null||!("IntersectionObserver" in window)){boot()}else{var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();boot()}},{rootMargin:"200px"});io.observe(host)}
});
})();
