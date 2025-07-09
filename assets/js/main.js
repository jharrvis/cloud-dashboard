// Modern Cloud Dashboard Application - Vanilla JavaScript
class CloudDashboard {
  constructor() {
    console.log("CloudDashboard constructor called");
    this.openWindows = new Map();
    this.windowZIndex = 1000;
    this.focusedWindow = null;
    this.init();
  }

  init() {
    console.log("CloudDashboard init called");
    this.initializeTimeUpdate();
    this.initializeTheme();
    this.initializeProfileDropdown();
    this.initializeSidebar();
    this.initializeAppModal();
    this.initializeDesktop();
    this.initializeTaskbar();
    this.initializeWindowResize();
    console.log("CloudDashboard initialization complete");
  }

  // Helper functions to replace jQuery
  $(selector) {
    if (selector.startsWith('#')) {
      return document.getElementById(selector.slice(1));
    }
    return document.querySelector(selector);
  }

  $$(selector) {
    return document.querySelectorAll(selector);
  }

  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  // Time Update
  initializeTimeUpdate() {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const systemTime = this.$('#systemTime');
      if (systemTime) systemTime.textContent = time;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // Theme Management
  initializeTheme() {
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    htmlElement.className = savedTheme;

    const themeToggle = this.$('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.classList.contains("light") ? "light" : "dark";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        htmlElement.className = newTheme;
        localStorage.setItem("theme", newTheme);
      });
    }
  }

  // Profile Dropdown
  initializeProfileDropdown() {
    const profileBtn = this.$('#profileBtn');
    const profileDropdown = this.$('#profileDropdown');
    
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("hidden");
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest("#profileBtn") && !e.target.closest("#profileDropdown")) {
          profileDropdown.classList.add("hidden");
        }
      });
    }
  }

  // Sidebar Management
  initializeSidebar() {
    const sidebar = this.$('#sidebar');
    const closeBtns = this.$$('#closeSidebar, #mobileMenu, #notificationToggle');
    
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (sidebar.classList.contains("w-80")) {
          sidebar.classList.remove("w-80");
          sidebar.classList.add("w-0");
          // Hide direct children
          Array.from(sidebar.children).forEach(el => el.style.display = 'none');
        } else {
          sidebar.classList.remove("w-0");
          sidebar.classList.add("w-80");
          setTimeout(() => {
            // Show direct children
            Array.from(sidebar.children).forEach(el => el.style.display = '');
          }, 100);
        }
      });
    });
  }

  // App Launch Modal
  initializeAppModal() {
    const appIcons = {
      drive: "fab fa-google-drive",
      dropbox: "fab fa-dropbox",
      gmail: "fas fa-envelope",
      calendar: "fas fa-calendar-alt",
      docs: "fas fa-file-alt",
      sheets: "fas fa-table",
      slides: "fas fa-file-powerpoint",
      photos: "fas fa-images",
    };

    const appCards = this.$$(".app-card");
    const appModal = this.$('#appModal');
    const modalContent = this.$('#modalContent');
    const modalTitle = this.$('#modalTitle');
    const modalIcon = this.$('#modalIcon');
    const cancelModal = this.$('#cancelModal');
    const launchApp = this.$('#launchApp');

    appCards.forEach(card => {
      card.addEventListener('click', () => {
        const appName = card.querySelector("p").textContent;
        const appKey = card.dataset.app;

        modalTitle.textContent = appName;
        modalIcon.className = appIcons[appKey] || "fas fa-rocket";
        appModal.classList.remove("hidden");
        appModal.classList.add("flex");

        setTimeout(() => {
          modalContent.classList.remove("scale-95", "opacity-0");
          modalContent.classList.add("scale-100", "opacity-100");
        }, 10);
      });
    });

    // Close Modal
    [cancelModal, appModal].forEach(el => {
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el || e.target.id === "cancelModal") {
            modalContent.classList.remove("scale-100", "opacity-100");
            modalContent.classList.add("scale-95", "opacity-0");
            setTimeout(() => {
              appModal.classList.add("hidden");
              appModal.classList.remove("flex");
            }, 300);
          }
        });
      }
    });

    // Launch App
    if (launchApp) {
      launchApp.addEventListener('click', () => {
        const appName = modalTitle.textContent;
        const appKey = Array.from(appCards).find(card => 
          card.querySelector("p").textContent === appName
        )?.dataset.app;

        // Close modal
        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
          appModal.classList.add("hidden");
          appModal.classList.remove("flex");
        }, 300);

        // Launch the application window
        this.launchApplication(appName, appKey);
      });
    }
  }

  // Desktop Icons
  initializeDesktop() {
    console.log("Initializing desktop icons...");
    const apps = [
      { name: "Drive", key: "drive", icon: "fab fa-google-drive", gradient: "icon-gradient-1" },
      { name: "Dropbox", key: "dropbox", icon: "fab fa-dropbox", gradient: "icon-gradient-2" },
      { name: "Gmail", key: "gmail", icon: "fas fa-envelope", gradient: "icon-gradient-3" },
      { name: "Calendar", key: "calendar", icon: "fas fa-calendar-alt", gradient: "icon-gradient-4" },
      { name: "Docs", key: "docs", icon: "fas fa-file-alt", gradient: "icon-gradient-5" },
      { name: "Sheets", key: "sheets", icon: "fas fa-table", gradient: "icon-gradient-6" },
      { name: "Slides", key: "slides", icon: "fas fa-file-powerpoint", gradient: "icon-gradient-7" },
      { name: "Photos", key: "photos", icon: "fas fa-images", gradient: "icon-gradient-8" },
    ];

    const desktopContainer = this.createElement('<div class="desktop-icons-container"></div>');
    document.body.appendChild(desktopContainer);
    console.log("Desktop container created and appended");

    apps.forEach((app, index) => {
      const icon = this.createElement(`
        <div class="desktop-icon" data-app="${app.key}">
          <div class="desktop-icon-image ${app.gradient}">
            <i class="${app.icon}"></i>
          </div>
          <div class="desktop-icon-label">${app.name}</div>
        </div>
      `);

      icon.addEventListener('click', () => this.launchApplication(app.name, app.key));
      icon.addEventListener('dblclick', () => this.launchApplication(app.name, app.key));
      desktopContainer.appendChild(icon);
    });
    
    console.log(`Created ${apps.length} desktop icons`);
  }

  // Taskbar
  initializeTaskbar() {
    console.log("Initializing taskbar...");
    const taskbar = this.createElement('<div class="taskbar"></div>');
    document.body.appendChild(taskbar);
    console.log("Taskbar created and appended");
  }

  // Launch Application
  launchApplication(appName, appKey) {
    if (this.openWindows.has(appKey)) {
      const existingWindow = this.openWindows.get(appKey);
      this.focusWindow(existingWindow);
      this.restoreWindow(existingWindow);
      return;
    }

    const windowId = `window-${appKey}-${Date.now()}`;
    const window = this.createWindow(windowId, appName, appKey);
    
    this.openWindows.set(appKey, window);
    this.focusWindow(window);
    this.addToTaskbar(appName, appKey, window);

    // Show success message
    const successText = this.$('#successText');
    const successMessage = this.$('#successMessage');
    if (successText && successMessage) {
      successText.textContent = `${appName} is opening...`;
      successMessage.classList.remove("translate-x-[120%]");
      successMessage.classList.add("translate-x-0");

      setTimeout(() => {
        successMessage.classList.remove("translate-x-0");
        successMessage.classList.add("translate-x-[120%]");
      }, 3000);
    }
  }

  // Create Window
  createWindow(windowId, appName, appKey) {
    const window = this.createElement(`
      <div class="desktop-app-window" id="${windowId}" data-app="${appKey}">
        <div class="window-titlebar">
          <div class="window-title">${appName}</div>
          <div class="window-controls">
            <button class="window-control close" data-action="close"></button>
            <button class="window-control minimize" data-action="minimize"></button>
            <button class="window-control maximize" data-action="maximize"></button>
          </div>
        </div>
        <div class="window-content">
          ${this.getAppContent(appKey)}
        </div>
      </div>
    `);

    // Position window
    const offset = this.openWindows.size * 30;
    Object.assign(window.style, {
      left: `${200 + offset}px`,
      top: `${150 + offset}px`,
      width: '800px',
      height: '600px',
      zIndex: ++this.windowZIndex
    });

    // Add window controls
    window.querySelectorAll(".window-control").forEach(control => {
      control.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        switch (action) {
          case "close":
            this.closeWindow(window, appKey);
            break;
          case "minimize":
            this.minimizeWindow(window);
            break;
          case "maximize":
            this.maximizeWindow(window);
            break;
        }
      });
    });

    // Make window draggable
    this.makeDraggable(window);

    // Make window resizable
    this.makeResizable(window);

    // Add click focus
    window.addEventListener('click', () => this.focusWindow(window));

    document.body.appendChild(window);
    return window;
  }

  // Get App Content
  getAppContent(appKey) {
    const contentTemplates = {
      dropbox: `
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-primary">Dropbox</h2>
            <button class="btn-primary px-4 py-2 rounded-lg">
              <i class="fas fa-upload mr-2"></i>Upload
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="glass rounded-xl p-4 glass-hover">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i class="fas fa-folder text-blue-500"></i>
                </div>
                <div>
                  <h4 class="text-primary font-medium">Documents</h4>
                  <p class="text-secondary text-sm">24 files</p>
                </div>
              </div>
            </div>
            
            <div class="glass rounded-xl p-4 glass-hover">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <i class="fas fa-folder text-green-500"></i>
                </div>
                <div>
                  <h4 class="text-primary font-medium">Photos</h4>
                  <p class="text-secondary text-sm">156 files</p>
                </div>
              </div>
            </div>
            
            <div class="glass rounded-xl p-4 glass-hover">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i class="fas fa-folder text-purple-500"></i>
                </div>
                <div>
                  <h4 class="text-primary font-medium">Projects</h4>
                  <p class="text-secondary text-sm">8 files</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-primary mb-4">Recent Files</h3>
            <div class="space-y-3">
              <div class="glass rounded-lg p-3 glass-hover flex items-center space-x-3">
                <div class="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                  <i class="fas fa-file-pdf text-red-500 text-sm"></i>
                </div>
                <div class="flex-1">
                  <h5 class="text-primary font-medium text-sm">Report.pdf</h5>
                  <p class="text-secondary text-xs">Modified 2 hours ago</p>
                </div>
                <button class="text-secondary hover:text-primary">
                  <i class="fas fa-download"></i>
                </button>
              </div>
              
              <div class="glass rounded-lg p-3 glass-hover flex items-center space-x-3">
                <div class="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                  <i class="fas fa-file-word text-blue-500 text-sm"></i>
                </div>
                <div class="flex-1">
                  <h5 class="text-primary font-medium text-sm">Document.docx</h5>
                  <p class="text-secondary text-xs">Modified yesterday</p>
                </div>
                <button class="text-secondary hover:text-primary">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `,
      gmail: `
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-primary">Gmail</h2>
            <button class="btn-primary px-4 py-2 rounded-lg">
              <i class="fas fa-plus mr-2"></i>Compose
            </button>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-1">
              <div class="space-y-2">
                <div class="glass rounded-lg p-3 glass-hover flex items-center space-x-3">
                  <i class="fas fa-inbox text-blue-500"></i>
                  <span class="text-primary">Inbox</span>
                  <span class="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">3</span>
                </div>
                <div class="glass rounded-lg p-3 glass-hover flex items-center space-x-3">
                  <i class="fas fa-star text-yellow-500"></i>
                  <span class="text-primary">Starred</span>
                </div>
                <div class="glass rounded-lg p-3 glass-hover flex items-center space-x-3">
                  <i class="fas fa-paper-plane text-green-500"></i>
                  <span class="text-primary">Sent</span>
                </div>
              </div>
            </div>
            
            <div class="lg:col-span-3">
              <div class="space-y-3">
                <div class="glass rounded-lg p-4 glass-hover">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-primary font-medium">Team Meeting Notes</h4>
                    <span class="text-xs text-secondary">2 hours ago</span>
                  </div>
                  <p class="text-secondary text-sm">Please find attached the meeting notes from today's discussion...</p>
                </div>
                
                <div class="glass rounded-lg p-4 glass-hover">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-primary font-medium">Project Update</h4>
                    <span class="text-xs text-secondary">1 day ago</span>
                  </div>
                  <p class="text-secondary text-sm">The latest project milestone has been completed. Next steps include...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      drive: `
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-primary">Google Drive</h2>
            <button class="btn-primary px-4 py-2 rounded-lg">
              <i class="fas fa-plus mr-2"></i>New
            </button>
          </div>
          
          <div class="mb-6">
            <div class="flex space-x-4">
              <button class="glass px-4 py-2 rounded-lg glass-hover text-primary">
                <i class="fas fa-th-large mr-2"></i>Grid
              </button>
              <button class="glass px-4 py-2 rounded-lg glass-hover text-primary">
                <i class="fas fa-list mr-2"></i>List
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${Array.from({length: 8}, (_, i) => `
              <div class="glass rounded-xl p-4 glass-hover">
                <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <i class="fas ${i % 2 === 0 ? 'fa-folder' : 'fa-file-alt'} text-blue-500"></i>
                </div>
                <h4 class="text-primary font-medium text-sm mb-1">${i % 2 === 0 ? 'Folder' : 'Document'} ${i + 1}</h4>
                <p class="text-secondary text-xs">Modified ${Math.floor(Math.random() * 7) + 1} days ago</p>
              </div>
            `).join('')}
          </div>
        </div>
      `
    };

    return contentTemplates[appKey] || `
      <div class="p-6">
        <h2 class="text-2xl font-bold text-primary mb-4">${appKey.charAt(0).toUpperCase() + appKey.slice(1)}</h2>
        <p class="text-secondary">This is a placeholder for the ${appKey} application. Content can be added here.</p>
      </div>
    `;
  }

  // Window Management
  focusWindow(window) {
    document.querySelectorAll(".desktop-app-window").forEach(w => w.classList.remove("window-focused"));
    window.classList.add("window-focused");
    window.style.zIndex = ++this.windowZIndex;
    this.focusedWindow = window;
    this.updateTaskbarActive(window);
  }

  closeWindow(window, appKey) {
    window.remove();
    this.openWindows.delete(appKey);
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appKey}"]`);
    if (taskbarItem) taskbarItem.remove();
    
    if (this.focusedWindow === window) {
      this.focusedWindow = null;
    }
  }

  minimizeWindow(window) {
    window.classList.add("window-minimized");
    const appKey = window.dataset.app;
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appKey}"]`);
    if (taskbarItem) taskbarItem.classList.remove("active");
  }

  restoreWindow(window) {
    window.classList.remove("window-minimized");
    this.focusWindow(window);
  }

  maximizeWindow(window) {
    const isMaximized = window.dataset.maximized === 'true';
    
    if (isMaximized) {
      // Restore
      const originalData = JSON.parse(window.dataset.original || '{}');
      Object.assign(window.style, {
        left: originalData.left || '200px',
        top: originalData.top || '150px',
        width: originalData.width || '800px',
        height: originalData.height || '600px'
      });
      delete window.dataset.maximized;
      delete window.dataset.original;
    } else {
      // Maximize
      const original = {
        left: window.style.left,
        top: window.style.top,
        width: window.style.width,
        height: window.style.height
      };
      window.dataset.original = JSON.stringify(original);
      Object.assign(window.style, {
        left: '0px',
        top: '0px',
        width: '100vw',
        height: 'calc(100vh - 60px)'
      });
      window.dataset.maximized = 'true';
    }
  }

  // Taskbar Management
  addToTaskbar(appName, appKey, window) {
    const taskbar = document.querySelector(".taskbar");
    const appIcons = {
      drive: "fab fa-google-drive",
      dropbox: "fab fa-dropbox",
      gmail: "fas fa-envelope",
      calendar: "fas fa-calendar-alt",
      docs: "fas fa-file-alt",
      sheets: "fas fa-table",
      slides: "fas fa-file-powerpoint",
      photos: "fas fa-images",
    };

    const taskbarItem = this.createElement(`
      <div class="taskbar-item active" data-app="${appKey}" title="${appName}">
        <i class="${appIcons[appKey] || 'fas fa-window-maximize'} text-primary"></i>
      </div>
    `);

    taskbarItem.addEventListener('click', () => {
      if (window.classList.contains("window-minimized")) {
        this.restoreWindow(window);
      } else if (this.focusedWindow === window) {
        this.minimizeWindow(window);
      } else {
        this.focusWindow(window);
      }
    });

    taskbar.appendChild(taskbarItem);
  }

  updateTaskbarActive(window) {
    document.querySelectorAll(".taskbar-item").forEach(item => item.classList.remove("active"));
    const appKey = window.dataset.app;
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appKey}"]`);
    if (taskbarItem) taskbarItem.classList.add("active");
  }

  // Make Window Draggable
  makeDraggable(window) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const titlebar = window.querySelector(".window-titlebar");
    
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains("window-control")) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(window.style.left);
      startTop = parseInt(window.style.top);
      
      window.style.userSelect = "none";
      document.body.style.userSelect = "none";
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      window.style.left = `${startLeft + deltaX}px`;
      window.style.top = `${Math.max(0, startTop + deltaY)}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        window.style.userSelect = "";
        document.body.style.userSelect = "";
      }
    });
  }

  // Make Window Resizable
  makeResizable(window) {
    // Simple resize handle in bottom-right corner
    const resizeHandle = this.createElement('<div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: se-resize; z-index: 10;"></div>');
    window.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.style.width);
      startHeight = parseInt(window.style.height);
      
      e.preventDefault();
      document.body.style.userSelect = "none";
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(400, startWidth + deltaX);
      const newHeight = Math.max(300, startHeight + deltaY);
      
      window.style.width = `${newWidth}px`;
      window.style.height = `${newHeight}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = "";
      }
    });
  }

  // Window Resize Handler
  initializeWindowResize() {
    window.addEventListener('resize', () => {
      const sidebar = this.$('#sidebar');
      if (window.innerWidth >= 1024) {
        sidebar.classList.remove("w-0");
        sidebar.classList.add("w-80");
        Array.from(sidebar.children).forEach(el => el.style.display = '');
      }
    });

    // Initialize sidebar state
    if (window.innerWidth < 1024) {
      const sidebar = this.$('#sidebar');
      sidebar.classList.remove("w-80");
      sidebar.classList.add("w-0");
      Array.from(sidebar.children).forEach(el => el.style.display = 'none');
    }
  }
}