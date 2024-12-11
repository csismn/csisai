document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.getElementById('gallery');
    const aboutModal = document.getElementById('about-modal');
    const closeModalBtn = aboutModal.querySelector('.close-modal');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const navItems = document.querySelectorAll('nav ul li[data-category]');
    const logo = document.querySelector('.logo');
    const aboutTriggerBottom = document.querySelector('.about-trigger-bottom');

    const categories = [
        { name: 'INSTLLTN', prefix: 'instlltn' },
        { name: 'SPC', prefix: 'spc' },
        { name: 'OBJCT', prefix: 'objct' },
        { name: 'BDY', prefix: 'bdy' },
        { name: 'ABSTCT', prefix: 'abstct' }
    ];

    let currentImageSet = [];
    let currentIndex = 0;
    let allImages = []; // Tüm görselleri tutacak değişken

    // İmajın var olup olmadığını kontrol eden fonksiyon
    function imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    // Belirli bir kategori için imajları yükleyen fonksiyon
    async function loadImagesForCategory(category, prefix) {
        const loadedImages = [];
        let i = 1;
        let consecutiveNotFound = 0;
        while (true) {
            const num = i < 10 ? '0' + i : i;
            const src = `images/${prefix}_${num}.webp`;
            const exists = await imageExists(src);
            if (exists) {
                loadedImages.push({ src: src, category: category });
                consecutiveNotFound = 0;
            } else {
                consecutiveNotFound++;
                if (consecutiveNotFound >= 5) {
                    break;
                }
            }
            i++;
        }
        return loadedImages;
    }

    // Tüm kategorilerden imajları yükleyen fonksiyon
    async function loadAllImages() {
        const allImages = [];
        for (const cat of categories) {
            const imgs = await loadImagesForCategory(cat.name, cat.prefix);
            allImages.push(...imgs);
        }
        return allImages;
    }

    // Dizi karıştırma fonksiyonu
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function createImageElement(img, index) {
        const imageEl = document.createElement('img');
        imageEl.dataset.src = img.src; // data-src özniteliğine atandı
        imageEl.alt = `${img.category} image`;
        imageEl.classList.add('lazy');
        imageEl.addEventListener('click', () => {
            openLightbox(allImages, index);
        });
        return imageEl;
    }

    // Galeriyi render eden fonksiyon (lazy loading ile)
    function renderGallery(images) {
        shuffleArray(images);
        gallery.style.opacity = '0'; // Fade out
        
         // Mevcut gözlemcileri kes
        if(window.imageObserver){
            window.imageObserver.disconnect();
        }
        setTimeout(() => {
            gallery.innerHTML = '';
            images.forEach((img, index) => {
                const imageEl = createImageElement(img, index);
                gallery.appendChild(imageEl);
            });
            
            window.imageObserver = new IntersectionObserver(handleIntersect, {
                rootMargin: '50px',
                threshold: 0.1
              });

              const lazyImages = gallery.querySelectorAll('.lazy');
              lazyImages.forEach(image => {
                  window.imageObserver.observe(image);
              });
             
            setTimeout(() => {
                gallery.style.opacity = '1'; // Fade in
            }, 50);
        }, 300);
        
    }
    
    function handleIntersect(entries, observer){
        entries.forEach(entry => {
            if(entry.isIntersecting){
                const image = entry.target;
                image.src = image.dataset.src;
                image.classList.remove('lazy');
                observer.unobserve(image);
                
            }
        });
    }

    // Lightbox açma fonksiyonu
    function openLightbox(images, index) {
        currentImageSet = images;
        currentIndex = index;
        lightboxImg.style.opacity = '0';
        lightbox.style.display = 'flex';
        lightbox.classList.add('show');
        lightboxImg.src = currentImageSet[currentIndex].src;
        lightboxImg.onload = () => {
            lightboxImg.style.opacity = '1';
        };
    }

    // Lightbox kapama fonksiyonu
    function closeLightbox() {
        lightbox.classList.remove('show');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 300);
    }

    // Önceki imaja geçiş fonksiyonu
    function showPrevImage() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentImageSet.length - 1;
        lightboxImg.style.opacity = '0';
        lightboxImg.src = currentImageSet[currentIndex].src;
    }

    // Sonraki imaja geçiş fonksiyonu
    function showNextImage() {
        currentIndex = (currentIndex < currentImageSet.length - 1) ? currentIndex + 1 : 0;
        lightboxImg.style.opacity = '0';
        lightboxImg.src = currentImageSet[currentIndex].src;
    }

    // Modal kapatma
    closeModalBtn.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    // Modal dışına tıklayınca kapatma
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Lightbox kapatma
    closeLightboxBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);

    // Kategori tıklama
    navItems.forEach((item) => {
        item.addEventListener('click', async () => {
            navItems.forEach((i) => i.classList.remove('active'));
            item.classList.add('active');
            const category = item.getAttribute('data-category');
            let imgs;
            if (category === '') {
                 imgs = allImages;
            } else {
                const catObj = categories.find((c) => c.name === category);
                if (catObj) {
                    imgs = allImages.filter(img => img.category === catObj.name);
                } else {
                    imgs = allImages;
                }
            }
            renderGallery(imgs);
        });
    });

    // Klavye kısayolları
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            if (aboutModal.style.display === 'flex') {
                aboutModal.style.display = 'none';
            }
            if (lightbox.style.display === 'flex') {
                closeLightbox();
            }
        }
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    });

    // Lightbox dışına tıklayınca kapatma
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Sol üst logo tıklanınca anasayfaya git
    // Logo zaten index.html'e yönlendiriyor, ekstra bir şey gerekmez

    // En alttaki ABOUT link tıklandığında modal açma
    aboutTriggerBottom.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'flex';
        aboutModal.style.justifyContent = 'center';
        aboutModal.style.alignItems = 'center';
    });

    // Sayfa yüklendiğinde tüm imajları yükle ve galeriyi render et
    (async () => {
        allImages = await loadAllImages();
        renderGallery(allImages);
    })();
});