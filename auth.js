function generateId(first,last){
    return (first+last+Date.now()).toLowerCase().replace(/\s/g,'');
    }
    
    function generateKey(){
    return Math.random().toString(36).substring(2)+Date.now();
    }
    
    function switchTab(tab){
    
    document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.classList.remove('active');
    });
    
    document.querySelectorAll('.auth-form').forEach(form=>{
    form.classList.remove('active');
    });
    
    if(tab==="signup"){
    document.querySelector('[data-tab="signup"]').classList.add('active');
    document.getElementById("signup-tab").classList.add('active');
    }else{
    document.querySelector('[data-tab="signin"]').classList.add('active');
    document.getElementById("signin-tab").classList.add('active');
    }
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.onclick=()=>switchTab(btn.dataset.tab);
    });
    
    document.getElementById("signupForm").onsubmit=function(e){
    e.preventDefault();
    
    let first=document.getElementById("firstName").value.trim();
    let last=document.getElementById("lastName").value.trim();
    
    let full=first+" "+last;
    let id=generateId(first,last);
    let key=generateKey();
    
    let user={
    id:id,
    name:full,
    secret:key
    };
    
    localStorage.setItem("gitsnap_user_"+id,JSON.stringify(user));
    localStorage.setItem("gitsnap_current",JSON.stringify(user));
    
    let blob=new Blob([JSON.stringify(user)],{type:"text/plain"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="gitsnap-secret.key";
    a.click();
    
    alert("Account created. Secret key downloaded.");
    window.location="dashboard.html";
    };
    
    document.getElementById("signinForm").onsubmit=function(e){
    e.preventDefault();
    
    let name=document.getElementById("signinUsername").value.trim();
    let file=document.getElementById("secretKeyFile").files[0];
    
    if(!file){
    alert("Upload key file");
    return;
    }
    
    let reader=new FileReader();
    
    reader.onload=function(ev){
    
    let data=JSON.parse(ev.target.result);
    
    if(data.name===name){
    localStorage.setItem("gitsnap_current",JSON.stringify(data));
    alert("Login successful");
    window.location="dashboard.html";
    }else{
    alert("Invalid credentials");
    }
    
    };
    
    reader.readAsText(file);
    };