#!/usr/bin/env python3
"""Standalone bilingual Aurora introduction. Standard library; no app env or AI requests."""
import argparse,html,json,shutil
from pathlib import Path
H=html.escape

def build(repo,out):
 cfg=json.loads((repo/'site/project.json').read_text());content=json.loads((repo/'site/content.json').read_text())
 out.mkdir(parents=True,exist_ok=True);media=out/'media';media.mkdir(exist_ok=True)
 shutil.copytree(repo/'site/assets',media,dirs_exist_ok=True)
 shutil.copy(repo/'docs/readme/assets/frankie.svg',media/'signature.svg');shutil.copy(repo/'docs/readme/banner.png',media/'banner.png');shutil.copy(repo/'site/style.css',out/'style.css');(out/'.nojekyll').touch()
 for lang,c in content.items():
  zh=lang=='zh';pre='../' if zh else './';dest=out/'zh' if zh else out;dest.mkdir(exist_ok=True)
  def rows(items):return ''.join('<article><h3>'+H(a)+'</h3><p>'+H(b)+'</p></article>' for a,b in items)
  gallery=''.join(f'<figure><a href="{pre}media/{name}"><img src="{pre}media/{name}" alt="{H(caption,quote=True)}" loading="lazy" width="1468" height="1247"></a><figcaption>{H(caption)}</figcaption></figure>' for name,caption in c['gallery'])
  nav=''.join(f'<a href="#{key}">{H(label)}</a>' for key,label in zip(['works','use','screens','start'],c['nav']))
  page=f'''<!doctype html><html lang="{'zh-CN' if zh else 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aurora | {H(c['headline'])}</title><meta name="description" content="{H(c['intro'])}"><meta name="theme-color" content="#FAFAF9"><link rel="canonical" href="{cfg['pages_url']+('zh/' if zh else '')}"><link rel="alternate" hreflang="en" href="{cfg['pages_url']}"><link rel="alternate" hreflang="zh-CN" href="{cfg['pages_url']}zh/"><meta property="og:type" content="website"><meta property="og:url" content="{cfg['pages_url']+('zh/' if zh else '')}"><meta property="og:title" content="Aurora"><meta property="og:description" content="{H(c['intro'])}"><meta property="og:image" content="{cfg['pages_url']}media/banner.png"><link rel="stylesheet" href="{pre}style.css"></head><body><a class="skip" href="#main">{c['skip']}</a>
<header class="shell"><a class="brand" href="{pre}">Aurora</a><nav aria-label="{'页面导航' if zh else 'Page navigation'}">{nav}<span class="languages"><a href="{pre}" lang="en" {'aria-current="page"' if not zh else ''}>EN</a><a href="{pre}zh/" lang="zh-CN" {'aria-current="page"' if zh else ''}>中文</a></span></nav></header>
<main id="main" class="shell"><section class="hero"><div><p class="eyebrow">{'养在瓶子里的极光云' if zh else 'Aurora in a bottle'}</p><h1>{H(c['headline'])}</h1><p class="intro">{H(c['intro'])}</p><a class="button" href="{cfg['app_url']}">{H(c['open'])} ↗</a></div><figure class="hero-art"><img src="{pre}media/landing-current.png" alt="{H(c['hero_alt'])}" width="1468" height="1247" fetchpriority="high"></figure></section>
<section class="section" id="works"><h2>{H(c['ways_title'])}</h2><p class="lead">{H(c['ways_intro'])}</p><div class="ways"><article id="diary"><h3>{H(c['diary_title'])}</h3><p>{H(c['diary_body'])}</p></article><article id="chat"><h3>{H(c['chat_title'])}</h3><p>{H(c['chat_body'])}</p></article></div><figure class="editor"><img src="{pre}media/zen-current.png" alt="{H(c['zen_caption'])}" loading="lazy" width="1468" height="1247"><figcaption>{H(c['zen_caption'])}</figcaption></figure></section>
<section class="section"><h2>{H(c['features_title'])}</h2><div class="feature-list">{rows(c['features'])}</div></section>
<section class="section" id="use"><h2>{H(c['workflow_title'])}</h2><ol class="steps">{''.join('<li><h3>'+H(a)+'</h3><p>'+H(b)+'</p></li>' for a,b in c['steps'])}</ol></section>
<section class="section" id="screens"><h2>{H(c['gallery_title'])}</h2><p class="lead">{H(c['gallery_intro'])}</p><div class="gallery">{gallery}</div></section>
<section class="section data" id="start"><h2>{H(c['data_title'])}</h2><div class="data-columns"><article><h3>{H(c['local_title'])}</h3><p>{H(c['local_body'])}</p></article><article><h3>{H(c['online_title'])}</h3><p>{H(c['online_body'])}</p></article></div><div class="backup"><h3>{H(c['backup_title'])}</h3><ol>{''.join('<li><h4>'+H(a)+'</h4><p>'+H(b)+'</p></li>' for a,b in c['backup_steps'])}</ol></div><p class="boundary">{H(c['limit'])}</p><details><summary>{H(c['run_title'])}</summary><pre><code>npm ci\nnpm run dev</code></pre><p>{H(c['run_body'])}</p><a href="https://github.com/{cfg['repository']}/blob/main/docs/local-storage.md">{'本地存储说明' if zh else 'Local storage documentation'} ↗</a></details></section></main>
<footer class="shell"><a href="https://github.com/SonghaiFan"><img src="{pre}media/signature.svg" width="96" height="36" alt="Frankie"></a><span>{H(c['footer'])}</span><div><a href="https://github.com/{cfg['repository']}">{H(c['source'])}</a><a href="https://github.com/{cfg['repository']}/blob/main/site/GUIDE.md">{H(c['guide'])}</a></div></footer></body></html>'''
  (dest/'index.html').write_text(page)
 print(out)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--out',default='_site');args=ap.parse_args();build(Path(__file__).resolve().parents[1],Path(args.out).resolve())
