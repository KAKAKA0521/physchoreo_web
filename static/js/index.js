window.HELP_IMPROVE_VIDEOJS = false;

// Demo carousel state
let currentDemoIndex = 0;
const totalDemos = 3;

// Scene states for each category
const categorySceneStates = {
  bounce: { current: 0, total: 3 },
  crash: { current: 0, total: 1 },
  fall: { current: 0, total: 2 },
  fly: { current: 0, total: 2 },
  melt: { current: 0, total: 2 }
};

// Change demo slide (manual only, no auto-advance)
function changeDemo(direction) {
  const items = document.querySelectorAll('.demo-item');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');
  
  // Pause all videos in current slide
  items[currentDemoIndex].querySelectorAll('video').forEach(v => v.pause());
  
  items[currentDemoIndex].classList.remove('active');
  indicators[currentDemoIndex].classList.remove('active');
  
  currentDemoIndex += direction;
  
  if (currentDemoIndex >= totalDemos) currentDemoIndex = 0;
  if (currentDemoIndex < 0) currentDemoIndex = totalDemos - 1;
  
  items[currentDemoIndex].classList.add('active');
  indicators[currentDemoIndex].classList.add('active');
  
  // Play videos in new active slide
  items[currentDemoIndex].querySelectorAll('video').forEach(v => v.play());
}

// Change scene within a category (Bounce, Crash, etc.)
function changeScene(category, direction) {
  const state = categorySceneStates[category];
  
  // If only 1 scene, do nothing
  if (state.total <= 1) return;
  
  const container = document.getElementById(`scenes-${category}`);
  const scenes = container.querySelectorAll('.scene-videos');
  const indicator = document.getElementById(`indicator-${category}`);
  
  // Pause all videos in current scene
  scenes[state.current].querySelectorAll('video').forEach(v => v.pause());
  
  scenes[state.current].classList.remove('active');
  
  state.current += direction;
  
  if (state.current >= state.total) state.current = 0;
  if (state.current < 0) state.current = state.total - 1;
  
  scenes[state.current].classList.add('active');
  
  // Update indicator text
  const sceneName = scenes[state.current].dataset.name;
  indicator.textContent = `${sceneName} (${state.current + 1}/${state.total})`;
  
  // Play videos in new active scene (if in viewport)
  const row = container.closest('.comparison-row');
  if (isElementInViewport(row)) {
    scenes[state.current].querySelectorAll('video').forEach(v => v.play());
  }
}

// Check if element is in viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0
  );
}

$(document).ready(function() {
  // Navbar burger toggle
  $(".navbar-burger").click(function() {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // Demo carousel indicators click handler
  document.querySelectorAll('.carousel-indicators .indicator').forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      const diff = index - currentDemoIndex;
      if (diff !== 0) {
        changeDemo(diff);
      }
    });
  });

  // NO auto-advance for demo carousel - let users control it manually
  // This allows longer videos like Bullet Time to play completely

  // Initialize - play videos in first active demo
  document.querySelectorAll('.demo-item.active video').forEach(v => v.play());
  
  // Intersection Observer for comparison rows
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.2
  };

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const row = entry.target;
      const activeScene = row.querySelector('.scene-videos.active');
      
      if (entry.isIntersecting) {
        // Play videos in active scene
        if (activeScene) {
          activeScene.querySelectorAll('video').forEach(v => v.play());
        }
      } else {
        // Pause all videos in this row
        row.querySelectorAll('video').forEach(v => v.pause());
      }
    });
  }, observerOptions);

  // Observe all comparison rows
  document.querySelectorAll('.comparison-row').forEach(row => {
    videoObserver.observe(row);
  });

  // Demo section observer
  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Play videos in active demo
        const activeDemo = entry.target.querySelector('.demo-item.active');
        if (activeDemo) {
          activeDemo.querySelectorAll('video').forEach(v => v.play());
        }
      } else {
        // Pause all demo videos
        entry.target.querySelectorAll('video').forEach(v => v.pause());
      }
    });
  }, observerOptions);

  const demoSection = document.querySelector('.demo-carousel-container');
  if (demoSection) {
    demoObserver.observe(demoSection);
  }
});
