"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = { id: string; title: string; type: string; price: number; tag: string; tone: string };
type User = { name: string; email: string } | null;

const demoProducts: Product[] = [
  { id: "nocturna", title: "Nocturna", type: "Colección · 24 fotos", price: 29, tag: "Más vendido", tone: "ruby" },
  { id: "luz-privada", title: "Luz privada", type: "Video · 08:42", price: 18, tag: "Nuevo", tone: "gold" },
  { id: "entre-lineas", title: "Entre líneas", type: "Editorial · 16 fotos", price: 24, tag: "Exclusivo", tone: "rose" },
  { id: "after-hours", title: "After hours", type: "Video · 12:10", price: 32, tag: "Premium", tone: "ink" },
];

const icons: Record<string, string> = { photo: "◫", video: "▷", collection: "◇", crown: "♕" };

export function Platform({ signedInUser }: { signedInUser: User }) {
  const [ageAccepted, setAgeAccepted] = useState(false);
  const [ageReady, setAgeReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todo");
  const [plan, setPlan] = useState<string | null>(null);
  const [auth, setAuth] = useState<"login" | "register" | null>(null);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem("ls-age-ok") === "yes";
    setAgeAccepted(accepted);
    setAgeReady(true);
    fetch("/api/platform").then((r) => r.ok ? r.json() : null).then((d) => d?.products?.length && setProducts(d.products)).catch(() => {});
  }, []);

  const visible = useMemo(() => products.filter((p) =>
    (filter === "Todo" || p.type.toLowerCase().includes(filter.toLowerCase())) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  ), [products, filter, search]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  function addToCart(product: Product) {
    if (cart.some((item) => item.id === product.id)) return notify("Este contenido ya está en tu bolsa");
    setCart((items) => [...items, product]);
    setCartOpen(true);
    notify(`${product.title} se añadió a tu bolsa`);
  }

  function toggleFavorite(id: string) {
    setFavorites((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id]);
  }

  async function sendContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/platform", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ticket", ...data }) });
    if (response.ok) setContactSent(true); else notify("No pudimos enviar el mensaje. Intenta nuevamente.");
  }

  if (!ageReady) return <main className="loading-screen">LOURDES SERPA</main>;

  return (
    <main>
      {!ageAccepted && (
        <div className="age-gate" role="dialog" aria-modal="true" aria-label="Confirmación de edad">
          <div className="age-card">
            <div className="monogram">LS</div>
            <p className="eyebrow">EXPERIENCIA PRIVADA</p>
            <h1>Antes de entrar</h1>
            <p>Este espacio contiene contenido exclusivo para adultos. Confirma que tienes al menos 18 años y aceptas nuestros términos.</p>
            <button className="primary wide" onClick={() => { localStorage.setItem("ls-age-ok", "yes"); setAgeAccepted(true); }}>Sí, soy mayor de edad</button>
            <a className="text-link" href="https://www.google.com">Salir del sitio</a>
            <small>Al continuar confirmas que cumples la edad mínima legal de tu país.</small>
          </div>
        </div>
      )}

      <div className="announcement">NUEVA COLECCIÓN · NOCTURNA <span>— Acceso anticipado para miembros</span></div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Lourdes Serpa, inicio"><span>LOURDES</span> SERPA</a>
        <nav className={menu ? "nav open" : "nav"} aria-label="Navegación principal">
          <a href="#contenido" onClick={() => setMenu(false)}>Contenido</a>
          <a href="#colecciones" onClick={() => setMenu(false)}>Colecciones</a>
          <a href="#membresias" onClick={() => setMenu(false)}>Membresías</a>
          <a href="#historia" onClick={() => setMenu(false)}>Sobre mí</a>
          <a href="#journal" onClick={() => setMenu(false)}>Journal</a>
        </nav>
        <div className="header-actions">
          {signedInUser ? <a className="account-pill" href="#panel">{signedInUser.name.split(" ")[0]}</a> : <button className="ghost desktop" onClick={() => setAuth("login")}>Ingresar</button>}
          <button className="bag" onClick={() => setCartOpen(true)} aria-label={`Bolsa con ${cart.length} productos`}>Bolsa <b>{cart.length}</b></button>
          <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Abrir menú">{menu ? "×" : "☰"}</button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">UN UNIVERSO SIN FILTROS</p>
          <h1>Lo que no ves<br/><em>en ningún otro lugar.</em></h1>
          <p className="lead">Fotografía, video y momentos creados para quienes quieren conocer una versión más íntima, artística y auténtica de Lourdes.</p>
          <div className="button-row">
            <a className="primary" href="#contenido">Explorar contenido <span>→</span></a>
            <button className="secondary" onClick={() => setPlan("Círculo Privado")}>Unirme al círculo</button>
          </div>
          <div className="trust-row"><span>18+ verificado</span><span>Pago protegido</span><span>Acceso privado</span></div>
        </div>
        <div className="hero-image" role="img" aria-label="Retrato editorial demostrativo de una modelo adulta">
          <div className="image-note">IMAGEN DEMOSTRATIVA · REEMPLAZAR CON MATERIAL AUTORIZADO</div>
          <div className="hero-stamp"><span>EDICIÓN</span><strong>07</strong><span>2026</span></div>
        </div>
        <div className="scroll-note">DESCUBRIR <span>↓</span></div>
      </section>

      <section className="manifesto">
        <p>Un espacio creado sin intermediarios.</p>
        <h2>Más cerca. Más real.<br/>Exclusivamente <em>tuyo.</em></h2>
      </section>

      <section className="section" id="contenido">
        <div className="section-heading">
          <div><p className="eyebrow">SELECCIÓN PRIVADA</p><h2>Últimos lanzamientos</h2></div>
          <a href="#catalogo">Ver todo el contenido →</a>
        </div>
        <div className="catalog-tools" id="catalogo">
          <div className="filters">{["Todo", "Colección", "Video", "Editorial"].map((f) => <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div>
          <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contenido" aria-label="Buscar contenido" /></label>
        </div>
        <div className="product-grid">
          {visible.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className={`product-art ${product.tone}`}>
                {index === 0 ? <img src="/editorial-hero.png" alt="Portada editorial demostrativa"/> : <div className="abstract-portrait"><span>{icons[index % 2 ? "video" : "photo"]}</span></div>}
                <span className="product-tag">{product.tag}</span>
                <button className={favorites.includes(product.id) ? "heart active" : "heart"} onClick={() => toggleFavorite(product.id)} aria-label="Guardar en favoritos">♥</button>
                <div className="locked"><span>Vista previa protegida</span></div>
              </div>
              <div className="product-info"><div><p>{product.type}</p><h3>{product.title}</h3></div><strong>${product.price}</strong></div>
              <button className="card-action" onClick={() => addToCart(product)}>Añadir a la bolsa <span>+</span></button>
            </article>
          ))}
          {!visible.length && <div className="empty">No encontramos contenido con esos filtros.</div>}
        </div>
      </section>

      <section className="collections" id="colecciones">
        <div className="collection-visual"><img src="/editorial-hero.png" alt="Editorial demostrativo Nocturna"/><div className="collection-count">01 / 04</div></div>
        <div className="collection-copy"><p className="eyebrow">COLECCIÓN DESTACADA</p><h2>Nocturna</h2><p>Una exploración de sombras, texturas y silencios. 24 fotografías en alta resolución y un cortometraje detrás de cámaras.</p><ul><li>24 fotografías exclusivas</li><li>Video detrás de cámaras · 06:18</li><li>Descarga HD con marca personalizada</li></ul><button className="primary" onClick={() => addToCart(products[0] ?? demoProducts[0])}>Descubrir la colección →</button></div>
      </section>

      <section className="memberships" id="membresias">
        <div className="section-heading light"><div><p className="eyebrow">MEMBRESÍAS</p><h2>Elige hasta dónde quieres entrar.</h2></div><p>Sin contratos. Cancela cuando quieras.</p></div>
        <div className="plan-grid">
          {[
            ["Esencial", "12", "Acceso a publicaciones semanales", "Galerías exclusivas", "10% de descuento en colecciones"],
            ["Círculo Privado", "29", "Todo el contenido Esencial", "Videos y colecciones completas", "Acceso anticipado y 25% de descuento"],
            ["Confidente", "59", "Acceso total sin límites", "Contenido mensual personalizado", "Prioridad en lanzamientos y eventos"],
          ].map((p, i) => <article className={i === 1 ? "plan featured" : "plan"} key={p[0]}>{i === 1 && <span className="recommended">MÁS ELEGIDO</span>}<p className="eyebrow">{String(i + 1).padStart(2, "0")}</p><h3>{p[0]}</h3><div className="price"><span>$</span><strong>{p[1]}</strong><small>/ mes</small></div><ul>{p.slice(2).map((x) => <li key={x}>✓ {x}</li>)}</ul><button onClick={() => setPlan(p[0])}>{i === 1 ? "Comenzar ahora" : "Elegir plan"} →</button></article>)}
        </div>
      </section>

      <section className="story" id="historia">
        <div><p className="eyebrow">SOBRE LOURDES</p><h2>La libertad de crear<br/><em>a mi manera.</em></h2><p>Este espacio nace para compartir mi trabajo de forma directa, cuidada y honesta. Cada sesión, cada historia y cada detalle está pensado por mí.</p><blockquote>“No se trata de mostrar más.<br/>Se trata de mostrar lo verdadero.”</blockquote><a href="#journal">Conoce mi historia →</a></div>
        <div className="story-art"><span>LS</span><small>EST. 2026</small></div>
      </section>

      <section className="portal-preview" id="panel">
        <div className="portal-copy"><p className="eyebrow">UNA PLATAFORMA COMPLETA</p><h2>Tu mundo privado,<br/>siempre contigo.</h2><p>Compras, membresías, favoritos, soporte y seguridad desde un panel claro. Los perfiles de creadora, vendedores y administración cuentan con espacios y permisos independientes.</p><div className="role-chips"><span>Comprador</span><span>Creadora</span><span>Afiliados</span><span>Administración</span></div><button className="secondary" onClick={() => signedInUser ? notify("Tu panel está listo") : setAuth("login")}>Abrir mi panel →</button></div>
        <div className="dashboard-card">
          <div className="dash-top"><span>Buenos días, Lourdes</span><b>● EN VIVO</b></div>
          <div className="metrics"><div><small>INGRESOS DEL MES</small><strong>$12,840</strong><em>↑ 18.4%</em></div><div><small>SUSCRIPTORES</small><strong>1,284</strong><em>+92 este mes</em></div></div>
          <div className="chart" aria-label="Gráfico demostrativo de ingresos"><i style={{height:"28%"}}/><i style={{height:"42%"}}/><i style={{height:"35%"}}/><i style={{height:"60%"}}/><i style={{height:"52%"}}/><i style={{height:"78%"}}/><i style={{height:"92%"}}/><i style={{height:"70%"}}/><i style={{height:"100%"}}/></div>
          <div className="dash-list"><span>Venta · Colección Nocturna</span><b>+$29.00</b></div><div className="dash-list"><span>Membresía · Círculo Privado</span><b>+$29.00</b></div>
        </div>
      </section>

      <section className="journal section" id="journal">
        <div className="section-heading"><div><p className="eyebrow">JOURNAL</p><h2>Detrás de la imagen</h2></div><a href="#journal">Todos los artículos →</a></div>
        <div className="article-grid"><article><div className="article-art wine">01</div><p>PROCESO CREATIVO · 6 MIN</p><h3>Cómo nació Nocturna: luz, silencio y una idea</h3><a href="#journal">Leer historia →</a></article><article><div className="article-art cream">02</div><p>PERSONAL · 4 MIN</p><h3>Por qué decidí crear este espacio</h3><a href="#journal">Leer historia →</a></article><article><div className="article-art dark">03</div><p>ESTILO · 5 MIN</p><h3>Las piezas que cambiaron mi forma de vestir</h3><a href="#journal">Leer historia →</a></article></div>
      </section>

      <section className="contact" id="soporte">
        <div><p className="eyebrow">CONTACTO & SOPORTE</p><h2>Estamos para ayudarte.</h2><p>Consultas sobre acceso, pagos, derechos de contenido o el programa de afiliados.</p><p className="contact-meta">Respuesta habitual: menos de 24 horas · soporte@lourdesserpa.com</p></div>
        {contactSent ? <div className="success-box"><strong>Mensaje recibido</strong><p>Tu solicitud fue registrada. Te responderemos por correo.</p></div> : <form onSubmit={sendContact}><label>Nombre<input name="name" required /></label><label>Correo<input name="email" type="email" required /></label><label>¿En qué podemos ayudarte?<select name="category"><option>Acceso y cuenta</option><option>Compras y pagos</option><option>Afiliados</option><option>Derechos de contenido</option></select></label><label>Mensaje<textarea name="message" required rows={4}/></label><button className="primary" type="submit">Enviar mensaje →</button></form>}
      </section>

      <footer><div className="footer-main"><div><a className="brand" href="#inicio"><span>LOURDES</span> SERPA</a><p>Contenido oficial. Creado y compartido con intención.</p></div><div><strong>EXPLORAR</strong><a href="#contenido">Contenido</a><a href="#colecciones">Colecciones</a><a href="#membresias">Membresías</a><a href="#journal">Journal</a></div><div><strong>AYUDA</strong><a href="#soporte">Soporte</a><a href="#faq">Preguntas frecuentes</a><a href="#soporte">Reportar contenido</a><a href="#panel">Programa de afiliados</a></div><div><strong>LEGAL</strong><a href="#legal">Privacidad</a><a href="#legal">Términos</a><a href="#legal">Reembolsos</a><a href="#legal">Derechos de autor</a></div></div><div className="footer-bottom"><span>© 2026 Lourdes Serpa. Todos los derechos reservados.</span><span>Contenido para mayores de 18 años · Imagen editorial demostrativa</span></div></footer>

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-title"><h2>Tu bolsa</h2><button onClick={() => setCartOpen(false)}>×</button></div>{cart.map((p) => <div className="cart-item" key={p.id}><div className={`cart-thumb ${p.tone}`}/><div><small>{p.type}</small><strong>{p.title}</strong><button onClick={() => setCart(cart.filter((x) => x.id !== p.id))}>Eliminar</button></div><b>${p.price}</b></div>)}{!cart.length && <div className="empty">Tu bolsa está esperando algo especial.</div>}<div className="cart-total"><span>Total</span><strong>${cart.reduce((a, b) => a + b.price, 0)} USD</strong></div><button disabled={!cart.length} className="primary wide" onClick={() => { setCartOpen(false); setAuth("login"); }}>Continuar al pago →</button><small className="secure-note">Pago cifrado. Nunca almacenamos los datos de tu tarjeta.</small></aside></div>}

      {(auth || plan) && <div className="modal-backdrop" onClick={() => { setAuth(null); setPlan(null); }}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => { setAuth(null); setPlan(null); }}>×</button><div className="monogram small">LS</div><p className="eyebrow">{plan ? `MEMBRESÍA · ${plan}` : auth === "register" ? "CREA TU CUENTA" : "BIENVENIDO DE NUEVO"}</p><h2>{plan ? "Un paso más cerca." : auth === "register" ? "Tu acceso privado" : "Ingresa a tu espacio"}</h2><form onSubmit={(e) => { e.preventDefault(); notify("Formulario validado. La identidad pública se conectará al configurar el proveedor."); }}><label>Correo<input required type="email" placeholder="tu@correo.com"/></label>{auth === "register" && <label>Fecha de nacimiento<input required type="date"/></label>}<label>Contraseña<input required type="password" minLength={8}/></label>{(auth === "register" || plan) && <label className="check"><input required type="checkbox"/> Confirmo que soy mayor de edad y acepto los términos.</label>}<button className="primary wide" type="submit">{plan ? "Continuar al pago" : auth === "register" ? "Crear cuenta" : "Ingresar"} →</button></form>{!plan && <button className="switch-auth" onClick={() => setAuth(auth === "login" ? "register" : "login")}>{auth === "login" ? "¿Aún no tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}</button>}<a className="chatgpt-auth" href="/signin-with-chatgpt?return_to=%2F">Continuar con ChatGPT</a><small>La integración comercial de correo, Google y Apple se habilita al conectar sus credenciales.</small></div></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
