const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
    menu.classList.toggle('open', !isOpen);
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const sectionLinks = [...document.querySelectorAll('.study-toc .side-link')];
const studySections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sectionLinks.length) {
  let activeLink = null;
  const activateLink = (link) => {
    if (!link) return;
    const changed = link !== activeLink;
    activeLink = link;

    if (changed) {
      sectionLinks.forEach((item) => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      });
    }
    link.classList.add('active');
    link.setAttribute('aria-current', 'location');

    const chapter = link.closest('.toc-chapter');
    let chapterWasCollapsed = false;
    if (chapter) {
      chapterWasCollapsed = !chapter.classList.contains('is-expanded');
      document.querySelectorAll('.toc-chapter').forEach((item) => {
        const expanded = item === chapter;
        item.classList.toggle('is-expanded', expanded);
        const chapterLink = item.querySelector(':scope > a.side-link');
        if (chapterLink) {
          chapterLink.setAttribute('aria-expanded', String(expanded));
          if (expanded && link !== chapterLink) chapterLink.classList.add('active');
        }
      });
    }

    if (changed || chapterWasCollapsed) {
      link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  };

  let scrollScheduled = false;
  const syncActiveSection = () => {
    scrollScheduled = false;
    let currentSection = null;
    const readingLine = Math.max(130, window.innerHeight * .35);

    studySections.forEach((section) => {
      if (section.getBoundingClientRect().top <= readingLine) currentSection = section;
    });

    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atPageBottom) currentSection = studySections[studySections.length - 1];
    if (!currentSection) return;

    const link = sectionLinks.find((item) => item.getAttribute('href') === `#${currentSection.id}`);
    activateLink(link);
  };
  const scheduleSectionSync = () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(syncActiveSection);
  };

  window.addEventListener('scroll', scheduleSectionSync, { passive: true });
  window.addEventListener('resize', scheduleSectionSync);
  window.addEventListener('hashchange', scheduleSectionSync);
  scheduleSectionSync();
}
