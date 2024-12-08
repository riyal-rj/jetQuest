import {login,logout} from './login';
import {updateDataPassword } from './updateData';

import { displayMap } from './mapbox';
import '@babel/polyfill';
import { showAlert } from './alerts';

const mapbox=document.getElementById('map');
const loginForm=document.querySelector('.form--login');
const logOutBtn=document.querySelector('.nav__el--logout');
const userDataForm=document.querySelector('.form-user-data');
const userPasswordForm=document.querySelector('.form-user-password');

if(mapbox)
{
    const locations=JSON.parse(mapbox.dataset.locations);
    displayMap(locations);
}

if(loginForm)
    loginForm.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    login(email,password);
});

if(logOutBtn)
    logOutBtn.addEventListener('click',logout);

if(userDataForm)
    userDataForm.addEventListener('submit',e=>{
    e.preventDefault();
    const form=new FormData();
    form.append('email',document.getElementById('email').value);
    form.append('name',document.getElementById('name').value);
    form.append('photo',document.getElementById('photo').files[0]);
    updateDataPassword(form,'data');
});


if(userPasswordForm)
    userPasswordForm.addEventListener('submit',e=>{
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent="Updating";
    const passwordCurrent=document.getElementById('password-current').value;
    const password=document.getElementById('password').value;
    const confirmPassword=document.getElementById('password-confirm').value;
    updateDataPassword({passwordCurrent,password,confirmPassword},'password');
    document.querySelector('.btn--save-password').textContent="Password Changed";
    document.getElementById('password-current').value='';
    document.getElementById('password').value='';
    document.getElementById('password-confirm').value='';
});