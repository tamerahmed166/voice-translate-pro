// Welcome Page Specific Script
// Handles welcome page interactions and animations

class WelcomeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupFAQ();
        this.setupScrollAnimations();
    }

    setupEventListeners() {
        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Feature cards hover effects
        this.setupFeatureCards();
        
        // Language tags interactions
        this.setupLanguageTags();
        
        // Tip cards interactions
        this.setupTipCards();
    }

    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupLanguageTags() {
        const languageTags = document.querySelectorAll('.language-tag');
        
        languageTags.forEach(tag => {
            tag.addEventListener('click', () => {
                // Add click animation
                tag.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    tag.style.transform = 'scale(1)';
                }, 150);
                
                // Show language info
                this.showLanguageInfo(tag.textContent);
            });
        });
    }

    setupTipCards() {
        const tipCards = document.querySelectorAll('.tip-card');
        
        tipCards.forEach(card => {
            card.addEventListener('click', () => {
                // Add click animation
                card.style.transform = 'translateY(-4px) scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'translateY(-4px) scale(1)';
                }, 200);
                
                // Show detailed tip
                const title = card.querySelector('h3').textContent;
                const description = card.querySelector('p').textContent;
                this.showDetailedTip(title, description);
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.feature-card, .step, .language-category, .tip-card, .faq-item'
        );
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            });
        });
    }

    setupScrollAnimations() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.welcome-hero');
            
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
            
            // Update floating cards position
            this.updateFloatingCards(scrolled);
        });
    }

    updateFloatingCards(scrolled) {
        const cards = document.querySelectorAll('.floating-card');
        
        cards.forEach((card, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrolled * speed;
            card.style.transform = `translateY(${yPos}px)`;
        });
    }

    showLanguageInfo(languageName) {
        // Create language info modal
        const modal = document.createElement('div');
        modal.className = 'language-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${languageName}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>هذه اللغة مدعومة بالكامل في مترجم الصوت الذكي مع:</p>
                    <ul>
                        <li>ترجمة نصية دقيقة</li>
                        <li>تعرف على الصوت</li>
                        <li>نطق طبيعي</li>
                        <li>ترجمة ذكية بالسياق</li>
                    </ul>
                    <div class="modal-actions">
                        <a href="translate.html" class="btn btn-primary">
                            <i class="fas fa-play"></i>
                            جرب الترجمة
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            max-width: 500px;
            width: 90%;
            animation: slideInUp 0.3s ease-out;
        `;
        
        // Add to page
        document.body.appendChild(modal);
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showDetailedTip(title, description) {
        // Create tip detail modal
        const modal = document.createElement('div');
        modal.className = 'tip-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${description}</p>
                    <div class="tip-examples">
                        <h4>أمثلة عملية:</h4>
                        <ul>
                            <li>استخدم Ctrl+Enter للترجمة السريعة</li>
                            <li>اضغط على زر الصوت لسماع النطق</li>
                            <li>احفظ الترجمات المهمة في المفضلة</li>
                        </ul>
                    </div>
                    <div class="modal-actions">
                        <a href="translate.html" class="btn btn-primary">
                            <i class="fas fa-rocket"></i>
                            جرب الآن
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles and functionality (similar to language info modal)
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            max-width: 600px;
            width: 90%;
            animation: slideInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(modal);
        
        // Close functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Utility method to add CSS animations
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-in {
                animation: slideInUp 0.6s ease-out;
            }
            
            .feature-card,
            .step,
            .language-category,
            .tip-card,
            .faq-item {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .feature-card.animate-in,
            .step.animate-in,
            .language-category.animate-in,
            .tip-card.animate-in,
            .faq-item.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize welcome manager
document.addEventListener('DOMContentLoaded', () => {
    const welcomeManager = new WelcomeManager();
    welcomeManager.addAnimationStyles();
});

