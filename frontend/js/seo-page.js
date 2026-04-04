(function () {
  const SeoPage = {
    setMeta(name, content, attr = "name") {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    },

    setCanonical(url) {
      if (!url) return;
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
    },

    setTitle(title) {
      if (title) document.title = title;
    },

    removeJsonLd(selector = '[data-seo-jsonld="dynamic"]') {
      document.querySelectorAll(selector).forEach((n) => n.remove());
    },

    appendJsonLd(obj) {
      if (!obj) return;
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "dynamic";
      script.textContent = JSON.stringify(obj);
      document.head.appendChild(script);
    },

    slugFromPath() {
      const params = new URLSearchParams(window.location.search);
      return params.get("slug") || "";
    },

    buildUrl(path) {
      if (!path) return window.location.href;
      if (/^https?:\/\//i.test(path)) return path;
      const normalized = path.startsWith("/") ? path : "/" + path.replace(/^\.\//, "");
      return `${window.location.origin}${normalized}`;
    },

    text(el) {
      return el ? el.textContent.trim().replace(/\s+/g, " ") : "";
    },

    productDataFromDom() {
      const scope = document.getElementById("product-detail");
      if (!scope || !scope.children.length) return null;
      const h1 = scope.querySelector("h1");
      const lead = scope.querySelector("p");
      const imgs = [...scope.querySelectorAll("img")]
        .map((img) => this.buildUrl(img.getAttribute("src")))
        .filter(Boolean);
      const priceNode = scope.querySelector("[data-price], .price, .product-price, strong");
      const priceMatch = priceNode ? (priceNode.textContent || "").replace(/[^\d]/g, "") : "";
      return {
        name: this.text(h1) || "Ficha de producto KAYO",
        description: this.text(lead) || document.querySelector('meta[name="description"]')?.content || "Producto KAYO en Allmate Motors",
        images: imgs.length ? imgs : [],
        price: priceMatch || null
      };
    },

    articleDataFromDom() {
      const scope = document.getElementById("news-detail");
      if (!scope || !scope.children.length) return null;
      const h1 = scope.querySelector("h1, h2");
      const excerpt = scope.querySelector("p");
      const img = scope.querySelector("img");
      const time = scope.querySelector("time, .article-date, [data-date]");
      return {
        headline: this.text(h1) || "Noticia Allmate Motors",
        description: this.text(excerpt) || document.querySelector('meta[name="description"]')?.content || "Noticia Allmate Motors",
        image: img ? this.buildUrl(img.getAttribute("src")) : null,
        datePublished: time?.getAttribute("datetime") || this.text(time) || null
      };
    },

    setOpenGraph({ title, description, url, image, type = "website" }) {
      this.setMeta("og:title", title, "property");
      this.setMeta("og:description", description, "property");
      this.setMeta("og:url", url, "property");
      this.setMeta("og:type", type, "property");
      if (image) this.setMeta("og:image", image, "property");
    },

    setTwitter({ title, description, image }) {
      this.setMeta("twitter:card", image ? "summary_large_image" : "summary");
      this.setMeta("twitter:title", title);
      this.setMeta("twitter:description", description);
      if (image) this.setMeta("twitter:image", image);
    },

    setBreadcrumb(list) {
      if (!Array.isArray(list) || !list.length) return;
      this.appendJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: list.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          item: item.url
        }))
      });
    },

    setStaticSeo({ title, description, path, image, type = "website", breadcrumbs = [] }) {
      const url = this.buildUrl(path || window.location.pathname + window.location.search);
      this.removeJsonLd();
      this.setTitle(title);
      this.setMeta("description", description);
      this.setCanonical(url);
      this.setOpenGraph({ title, description, url, image, type });
      this.setTwitter({ title, description, image });
      if (breadcrumbs.length) this.setBreadcrumb(breadcrumbs);
    },

    setProductSeo(product) {
      if (!product) return;
      const title = `${product.name} | Precio y ficha técnica | Allmate Motors`;
      const description = product.description;
      const image = product.images?.[0];
      this.setStaticSeo({
        title,
        description,
        path: `/producto.html?slug=${encodeURIComponent(this.slugFromPath())}`,
        image,
        type: "product",
        breadcrumbs: [
          { name: "Inicio", url: this.buildUrl("/index.html") },
          { name: "Productos", url: this.buildUrl("/productos.html") },
          { name: product.name, url: window.location.href }
        ]
      });
      this.appendJsonLd({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images || [],
        description: product.description,
        brand: { "@type": "Brand", name: "KAYO" },
        offers: {
          "@type": "Offer",
          url: window.location.href,
          priceCurrency: "CLP",
          price: product.price || undefined,
          availability: "https://schema.org/InStock"
        }
      });
    },

    setArticleSeo(article) {
      if (!article) return;
      const title = `${article.headline} | News | Allmate Motors`;
      const description = article.description;
      const image = article.image;
      this.setStaticSeo({
        title,
        description,
        path: `/noticia.html?slug=${encodeURIComponent(this.slugFromPath())}`,
        image,
        type: "article",
        breadcrumbs: [
          { name: "Inicio", url: this.buildUrl("/index.html") },
          { name: "News", url: this.buildUrl("/news.html") },
          { name: article.headline, url: window.location.href }
        ]
      });
      this.appendJsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.headline,
        description: article.description,
        image: image ? [image] : [],
        datePublished: article.datePublished || undefined,
        author: { "@type": "Organization", name: "Allmate Motors" },
        publisher: {
          "@type": "Organization",
          name: "Allmate Motors",
          logo: {
            "@type": "ImageObject",
            url: this.buildUrl("/images/branding/logo-principal.jpeg")
          }
        },
        mainEntityOfPage: window.location.href
      });
    },

    setLocalBusinessSeo() {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content || "";
      const image = this.buildUrl("/images/branding/logo-principal.jpeg");
      this.setOpenGraph({ title, description, url: window.location.href, image, type: "website" });
      this.setTwitter({ title, description, image });
      this.appendJsonLd({
        "@context": "https://schema.org",
        "@type": "MotorcycleDealer",
        name: "Allmate Motors",
        url: this.buildUrl("/index.html"),
        logo: image,
        image,
        telephone: "+56 9 9217 8719",
        email: "contacto@allmate.cl",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle Corcovado #991, Cerro Santa Elena",
          addressLocality: "Coronel",
          addressRegion: "Biobío",
          addressCountry: "CL"
        },
        areaServed: ["Coronel", "Concepción", "Gran Concepción", "Región del Biobío"],
        sameAs: ["https://www.instagram.com/allmatemotors.cl/"]
      });
    },

    autoRun() {
      const page = document.body?.dataset?.page;
      if (!page) return;
      const title = document.title;
      const desc = document.querySelector('meta[name="description"]')?.content || "";
      switch (page) {
        case "home":
          this.removeJsonLd();
          this.setCanonical(this.buildUrl("/index.html"));
          this.setLocalBusinessSeo();
          break;
        case "productos":
          this.setStaticSeo({
            title,
            description: desc,
            path: "/productos.html",
            image: this.buildUrl("/images/branding/logo-principal.jpeg"),
            breadcrumbs: [
              { name: "Inicio", url: this.buildUrl("/index.html") },
              { name: "Productos", url: this.buildUrl("/productos.html") }
            ]
          });
          break;
        case "ofertas":
          this.setStaticSeo({
            title,
            description: desc,
            path: "/ofertas.html",
            image: this.buildUrl("/images/branding/logo-principal.jpeg"),
            breadcrumbs: [
              { name: "Inicio", url: this.buildUrl("/index.html") },
              { name: "Ofertas", url: this.buildUrl("/ofertas.html") }
            ]
          });
          break;
        case "carrito":
          this.setStaticSeo({
            title,
            description: desc,
            path: "/carrito.html",
            image: this.buildUrl("/images/branding/logo-principal.jpeg"),
            breadcrumbs: [
              { name: "Inicio", url: this.buildUrl("/index.html") },
              { name: "Carrito", url: this.buildUrl("/carrito.html") }
            ]
          });
          break;
        case "contacto":
          this.setStaticSeo({
            title,
            description: desc,
            path: "/contacto.html",
            image: this.buildUrl("/images/branding/logo-principal.jpeg"),
            breadcrumbs: [
              { name: "Inicio", url: this.buildUrl("/index.html") },
              { name: "Contacto", url: this.buildUrl("/contacto.html") }
            ]
          });
          this.setLocalBusinessSeo();
          break;
        case "news":
          this.setStaticSeo({
            title,
            description: desc,
            path: "/news.html",
            image: this.buildUrl("/images/branding/logo-principal.jpeg"),
            breadcrumbs: [
              { name: "Inicio", url: this.buildUrl("/index.html") },
              { name: "News", url: this.buildUrl("/news.html") }
            ]
          });
          break;
        case "producto": {
          const run = () => {
            const data = this.productDataFromDom();
            if (data) {
              this.setProductSeo(data);
              return true;
            }
            return false;
          };
          if (!run()) {
            const observer = new MutationObserver(() => {
              if (run()) observer.disconnect();
            });
            const target = document.getElementById("product-detail") || document.body;
            observer.observe(target, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 8000);
          }
          break;
        }
        case "noticia": {
          const run = () => {
            const data = this.articleDataFromDom();
            if (data) {
              this.setArticleSeo(data);
              return true;
            }
            return false;
          };
          if (!run()) {
            const observer = new MutationObserver(() => {
              if (run()) observer.disconnect();
            });
            const target = document.getElementById("news-detail") || document.body;
            observer.observe(target, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 8000);
          }
          break;
        }
      }
    }
  };

  window.SeoPage = SeoPage;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => SeoPage.autoRun());
  } else {
    SeoPage.autoRun();
  }
})();
