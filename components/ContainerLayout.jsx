// components/ContainerLayout.jsx
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { API_URL, API_KEY, mask, health } from '../lib/api';

function SideItem({ href, label, icon, active }) {
  return (
    <Link href={href} style={{
      display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
      borderRadius:10, textDecoration:'none',
      background: active ? '#0f172a' : 'transparent',
      color: active ? '#fff' : '#0f172a', fontWeight: active ? 600 : 500
    }}>
      <span>{icon}</span><span>{label}</span>
    </Link>
  );
}

export default function ContainerLayout({ cid, active, children }) {
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiError, setApiError] = useState('');
  const apiInfo = useMemo(() => ({ API_URL, API_KEY_MASKED: mask(API_KEY) }), []);

  useEffect(() => { (async()=>{ try{ await health(); setApiHealthy(true);}catch(e){ setApiHealthy(false); setApiError(e.message);} })(); }, []);

  const base = `/containers/${encodeURIComponent(cid || 'new')}`;

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', color:'#0f172a' }}>
      <header style={{height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:'1px solid #e5e7eb',background:'#fff'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{ width:24, height:24, borderRadius:6, background:'#111' }}/>
          <div>
            <div style={{ fontWeight:700 }}>TagSoft — STM v1.0</div>
            <div style={{ fontSize:12, opacity:.7 }}>
              Container: <b>{cid || 'novo'}</b> — <Link href="/containers" style={{ textDecoration:'none' }}>voltar para lista</Link>
            </div>
          </div>
        </div>
        <div style={{ fontSize:12 }}>
          API: <code>{apiInfo.API_URL}</code> — key: <code>{apiInfo.API_KEY_MASKED}</code> — status: {apiHealthy===null?'checando…':apiHealthy?'🟢 online':'🔴 offline'}
          {!apiHealthy && apiError ? <span style={{ color:'#b00' }}> — {apiError}</span> : null}
        </div>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16, maxWidth:1200, margin:'0 auto', padding:16 }}>
        <aside style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:8 }}>
          <SideItem href={`${base}`}                   label="Visão geral"  icon="📋" active={active==='overview'} />
          <SideItem href={`${base}/tags`}             label="Tags"         icon="🧩" active={active==='tags'} />
          <SideItem href={`${base}/triggers`}         label="Acionadores"  icon="⏱️" active={active==='triggers'} />
          <SideItem href={`${base}/variables`}        label="Variáveis"    icon="🔗" active={active==='variables'} />
          <SideItem href={`${base}/folders`}          label="Pastas"       icon="📁" active={active==='folders'} />
          <SideItem href={`${base}/models`}           label="Modelos"      icon="🧱" active={active==='models'} />
          <hr style={{ border:0, borderTop:'1px solid #eee', margin:'8px 0' }}/>
          <SideItem href={`${base}/versions`}         label="Versões"      icon="🗂️" active={active==='versions'} />
          <SideItem href={`${base}/admin`}            label="Administrador"icon="⚙️" active={active==='admin'} />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

export function Card({ title, right, children }) {
  return (
    <section style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h3 style={{ margin:0 }}>{title}</h3>{right}
      </div>
      {children}
    </section>
  );
}
