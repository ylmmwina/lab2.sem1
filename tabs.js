(function () {
    function selectTab(targetId) {
        // кнопки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.target === targetId);
        });
        // вікна
        document.querySelectorAll('.view').forEach(sec => {
            sec.classList.toggle('is-active', sec.id === targetId);
        });
    }

    // навішуємо хендлери після завантаження DOM
    function initTabs() {
        const firstBtn = document.querySelector('.tab-btn');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => selectTab(btn.dataset.target));
        });
        // якщо ще нічого не активне — увімкнемо першу вкладку
        const anyActive = document.querySelector('.tab-btn.is-active');
        if (!anyActive && firstBtn) {
            firstBtn.classList.add('is-active');
            selectTab(firstBtn.dataset.target);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
    } else {
        initTabs();
    }
})();
