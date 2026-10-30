#!/usr/bin/env python3
"""Run this after you edit any inline <script> in index.html:  python3 update-csp.py index.html
It recomputes the SHA-256 hashes in the Content-Security-Policy meta tag so the edited scripts still run.
(Editing the qa-config JSON block does NOT need this.)"""
import re,sys,hashlib,base64
p=sys.argv[1] if len(sys.argv)>1 else "index.html"
s=open(p,encoding="utf-8").read()
h=["'sha256-%s'"%base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
   for m in re.finditer(r'<script(?![^>]*\bsrc=)(?![^>]*\btype="application/(?:ld\+)?json")[^>]*>(.*?)</script>',s,re.S)]
m=re.search(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")',s)
csp=re.sub(r"(?:'sha256-[^']+'\s*)+"," ".join(h)+" ",m.group(2),count=1)
open(p,"w",encoding="utf-8").write(s[:m.start(2)]+csp+s[m.end(2):])
print(len(h),"inline scripts hashed")
