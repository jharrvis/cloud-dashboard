// Modern Cloud Dashboard Application
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

  // Time Update
  initializeTimeUpdate() {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      $("#systemTime").text(time);
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // Theme Management
  initializeTheme() {
    const htmlElement = $("html");
    const savedTheme = localStorage.getItem("theme") || "light";
    htmlElement.removeClass("light dark").addClass(savedTheme);

    $("#themeToggle").click(() => {
      const currentTheme = htmlElement.hasClass("light") ? "light" : "dark";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      htmlElement.removeClass(currentTheme).addClass(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  // Profile Dropdown
  initializeProfileDropdown() {
    $("#profileBtn").click((e) => {
      e.stopPropagation();
      $("#profileDropdown").toggleClass("hidden");
    });

    $(document).click((e) => {
      if (!$(e.target).closest("#profileBtn, #profileDropdown").length) {
        $("#profileDropdown").addClass("hidden");
      }
    });
  }

  // Sidebar Management
  initializeSidebar() {
    $("#closeSidebar, #mobileMenu, #notificationToggle").click(() => {
      const sidebar = $("#sidebar");
      if (sidebar.hasClass("w-80")) {
        sidebar.removeClass("w-80").addClass("w-0");
        sidebar.find("> *").hide();
      } else {
        sidebar.removeClass("w-0").addClass("w-80");
        setTimeout(() => {
          sidebar.find("> *").show();
        }, 100);
      }
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

    $(".app-card").click((e) => {
      const appName = $(e.currentTarget).find("p").text();
      const appKey = $(e.currentTarget).data("app");

      $("#modalTitle").text(appName);
      $("#modalIcon").attr("class", appIcons[appKey] || "fas fa-rocket");
      $("#appModal").removeClass("hidden").addClass("flex");

      setTimeout(() => {
        $("#modalContent")
          .removeClass("scale-95 opacity-0")
          .addClass("scale-100 opacity-100");
      }, 10);
    });

    $("#cancelModal, #appModal").click((e) => {
      if (e.target === e.currentTarget || $(e.target).attr("id") === "cancelModal") {
        $("#modalContent")
          .removeClass("scale-100 opacity-100")
          .addClass("scale-95 opacity-0");
        setTimeout(() => {
          $("#appModal").addClass("hidden").removeClass("flex");
        }, 300);
      }
    });

    $("#launchApp").click(() => {
      const appName = $("#modalTitle").text();
      const appKey = $(".app-card").filter((i, el) => $(el).find("p").text() === appName).data("app");

      // Close modal
      $("#modalContent")
        .removeClass("scale-100 opacity-100")
        .addClass("scale-95 opacity-0");
      setTimeout(() => {
        $("#appModal").addClass("hidden").removeClass("flex");
      }, 300);

      // Launch the application window
      this.launchApplication(appName, appKey);
    });
  }

  // Desktop Icons
  initializeDesktop() {
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

    const desktopContainer = $('<div class="desktop-icons-container"></div>');
    $("body").append(desktopContainer);

    apps.forEach((app, index) => {
      const icon = $(`
        <div class="desktop-icon" data-app="${app.key}">
          <div class="desktop-icon-image ${app.gradient}">
            <i class="${app.icon}"></i>
          </div>
          <div class="desktop-icon-label">${app.name}</div>
        </div>
      `);

      icon.click(() => this.launchApplication(app.name, app.key));
      icon.dblclick(() => this.launchApplication(app.name, app.key));
      desktopContainer.append(icon);
    });
  }

  // Taskbar
  initializeTaskbar() {
    const taskbar = $('<div class="taskbar"></div>');
    $("body").append(taskbar);
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
    $("#successText").text(`${appName} is opening...`);
    $("#successMessage")
      .removeClass("translate-x-[120%]")
      .addClass("translate-x-0");

    setTimeout(() => {
      $("#successMessage")
        .removeClass("translate-x-0")
        .addClass("translate-x-[120%]");
    }, 3000);
  }

  // Create Window
  createWindow(windowId, appName, appKey) {
    const window = $(`
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
    window.css({
      left: 200 + offset,
      top: 150 + offset,
      width: 800,
      height: 600,
      zIndex: ++this.windowZIndex
    });

    // Add window controls
    window.find(".window-control").click((e) => {
      const action = $(e.target).data("action");
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

    // Make window draggable
    this.makeDraggable(window);

    // Make window resizable
    this.makeResizable(window);

    // Add click focus
    window.click(() => this.focusWindow(window));

    $("body").append(window);
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
    $(".desktop-app-window").removeClass("window-focused");
    window.addClass("window-focused");
    window.css("zIndex", ++this.windowZIndex);
    this.focusedWindow = window;
    this.updateTaskbarActive(window);
  }

  closeWindow(window, appKey) {
    window.remove();
    this.openWindows.delete(appKey);
    $(`.taskbar-item[data-app="${appKey}"]`).remove();
    
    if (this.focusedWindow === window) {
      this.focusedWindow = null;
    }
  }

  minimizeWindow(window) {
    window.addClass("window-minimized");
    const appKey = window.data("app");
    const taskbarItem = $(`.taskbar-item[data-app="${appKey}"]`);
    taskbarItem.removeClass("active");
  }

  restoreWindow(window) {
    window.removeClass("window-minimized");
    this.focusWindow(window);
  }

  maximizeWindow(window) {
    const isMaximized = window.data("maximized");
    
    if (isMaximized) {
      // Restore
      const originalData = window.data("original");
      window.css({
        left: originalData.left,
        top: originalData.top,
        width: originalData.width,
        height: originalData.height
      });
      window.removeData("maximized original");
    } else {
      // Maximize
      const original = {
        left: window.css("left"),
        top: window.css("top"),
        width: window.css("width"),
        height: window.css("height")
      };
      window.data("original", original);
      window.css({
        left: 0,
        top: 0,
        width: "100vw",
        height: "calc(100vh - 60px)"
      });
      window.data("maximized", true);
    }
  }

  // Taskbar Management
  addToTaskbar(appName, appKey, window) {
    const taskbar = $(".taskbar");
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

    const taskbarItem = $(`
      <div class="taskbar-item active" data-app="${appKey}" title="${appName}">
        <i class="${appIcons[appKey] || 'fas fa-window-maximize'} text-primary"></i>
      </div>
    `);

    taskbarItem.click(() => {
      if (window.hasClass("window-minimized")) {
        this.restoreWindow(window);
      } else if (this.focusedWindow === window) {
        this.minimizeWindow(window);
      } else {
        this.focusWindow(window);
      }
    });

    taskbar.append(taskbarItem);
  }

  updateTaskbarActive(window) {
    $(".taskbar-item").removeClass("active");
    const appKey = window.data("app");
    $(`.taskbar-item[data-app="${appKey}"]`).addClass("active");
  }

  // Make Window Draggable
  makeDraggable(window) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const titlebar = window.find(".window-titlebar");
    
    titlebar.mousedown((e) => {
      if ($(e.target).hasClass("window-control")) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(window.css("left"));
      startTop = parseInt(window.css("top"));
      
      window.css("user-select", "none");
      $("body").css("user-select", "none");
    });

    $(document).mousemove((e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      window.css({
        left: startLeft + deltaX,
        top: Math.max(0, startTop + deltaY)
      });
    });

    $(document).mouseup(() => {
      if (isDragging) {
        isDragging = false;
        window.css("user-select", "");
        $("body").css("user-select", "");
      }
    });
  }

  // Make Window Resizable
  makeResizable(window) {
    // Simple resize handle in bottom-right corner
    const resizeHandle = $('<div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: se-resize; z-index: 10;"></div>');
    window.append(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.mousedown((e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.css("width"));
      startHeight = parseInt(window.css("height"));
      
      e.preventDefault();
      $("body").css("user-select", "none");
    });

    $(document).mousemove((e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(400, startWidth + deltaX);
      const newHeight = Math.max(300, startHeight + deltaY);
      
      window.css({
        width: newWidth,
        height: newHeight
      });
    });

    $(document).mouseup(() => {
      if (isResizing) {
        isResizing = false;
        $("body").css("user-select", "");
      }
    });
  }

  // Window Resize Handler
  initializeWindowResize() {
    $(window).resize(() => {
      if (window.innerWidth >= 1024) {
        $("#sidebar").removeClass("w-0").addClass("w-80");
        $("#sidebar").find("> *").show();
      }
    });

    // Initialize sidebar state
    if (window.innerWidth < 1024) {
      $("#sidebar").removeClass("w-80").addClass("w-0");
      $("#sidebar").find("> *").hide();
    }
  }
}

// Initialize Dashboard when DOM is ready
$(document).ready(() => {
  console.log("DOM ready, initializing CloudDashboard...");
  new CloudDashboard();
});