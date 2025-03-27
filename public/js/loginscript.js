const wrapper=document.querySelector(".wrapper");
const registerlink=document.querySelector(".register-link");
const loginlink=document.querySelector(".login-link");
const textContainer=document.querySelector(".textContainer");
registerlink.onclick=()=>{
    wrapper.classList.add("active");
}
loginlink.onclick=()=>{
    wrapper.classList.remove('active');
}
