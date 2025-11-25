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

// Track which videos have been loaded
const loadedVideos = new Set();

// Load and play video
function loadAndPlayVideo(video) {
  if (!loadedVideos.has(video)) {
    video.load();
    loadedVideos.add(video);
  }
  video.play().catch(() => {}); // Ignore autoplay errors
}

// Change demo slide (manual only)
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
  
  // Load and play videos in new active slide
  items[currentDemoIndex].querySelectorAll('video').forEach(v => loadAndPlayVideo(v));
}

// Change scene within a category
function changeScene(category, direction) {
  const state = categorySceneStates[category];
  
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
  
  // Update indicator
  const sceneName = scenes[state.current].dataset.name;
  indicator.textContent = `${sceneName} (${state.current + 1}/${state.total})`;
  
  // Load and play videos in new active scene (if visible)
  const row = container.closest('.comparison-row');
  if (isElementInViewport(row)) {
    scenes[state.current].querySelectorAll('video').forEach(v => loadAndPlayVideo(v));
  }
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
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
      if (diff !== 0) changeDemo(diff);
    });
  });

  // Intersection Observer for lazy loading
  const observerOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  };

  // Observer for comparison rows
  const comparisonObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const row = entry.target;
      const activeScene = row.querySelector('.scene-videos.active');
      
      if (entry.isIntersecting && activeScene) {
        // Load and play only active scene videos
        activeScene.querySelectorAll('video').forEach(v => loadAndPlayVideo(v));
      } else {
        // Pause all videos when out of view
        row.querySelectorAll('video').forEach(v => v.pause());
      }
    });
  }, observerOptions);

  document.querySelectorAll('.comparison-row').forEach(row => {
    comparisonObserver.observe(row);
  });

  // Observer for demo section
  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeDemo = entry.target.querySelector('.demo-item.active');
        if (activeDemo) {
          activeDemo.querySelectorAll('video').forEach(v => loadAndPlayVideo(v));
        }
      } else {
        entry.target.querySelectorAll('video').forEach(v => v.pause());
      }
    });
  }, observerOptions);

  const demoSection = document.querySelector('.demo-carousel-container');
  if (demoSection) {
    demoObserver.observe(demoSection);
  }

  // Initial load - only load videos visible on first screen (demo section)
  const activeDemo = document.querySelector('.demo-item.active');
  if (activeDemo && isElementInViewport(activeDemo)) {
    activeDemo.querySelectorAll('video').forEach(v => loadAndPlayVideo(v));
  }
});
