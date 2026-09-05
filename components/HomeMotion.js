'use client';
import { animate, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';

const selector='.section-title,.work-card,.discipline-list>div,.timeline-item,.case-study img,.case-copy,.reason-grid>div,.sector-list a,.technical-icons>div,.resource-grid article,.project-cta';
export default function HomeMotion({locale}){
  const reduced=useReducedMotion();
  useEffect(()=>{
    document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';
    if(!/^\/(en|ar)\/?$/.test(location.pathname)) return;
    const body=document.body;body.classList.add('motion-page');const heroFrame=requestAnimationFrame(()=>body.classList.add('hero-ready'));
    const items=[...document.querySelectorAll(selector)];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('in-view');observer.unobserve(entry.target)}),{threshold:.16});
    items.forEach((item,i)=>{item.style.setProperty('--motion-delay',`${Math.min((i%6)*70,280)}ms`);observer.observe(item)});
    document.querySelectorAll('.stat').forEach((item,i)=>{item.style.setProperty('--motion-delay',`${i*90}ms`);observer.observe(item)});
    if(!reduced){
      const stats=[...document.querySelectorAll('.stat strong')];
      const statsObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const node=entry.target;const original=node.textContent.trim();if(/^\d+\+?$/.test(original)){const value=Number(original.replace('+',''));if(value&&value!==2009){animate(0,value,{duration:1.35,ease:[.22,1,.36,1],onUpdate:v=>node.textContent=`${Math.round(v).toLocaleString()}${original.endsWith('+')?'+':''}`})}}statsObserver.unobserve(node)}),{threshold:.6});stats.forEach(s=>statsObserver.observe(s));
    }
    return()=>{cancelAnimationFrame(heroFrame);observer.disconnect();body.classList.remove('motion-page','hero-ready')};
  },[locale,reduced]);
  return null;
}
