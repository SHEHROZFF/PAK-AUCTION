/**
 * Sell Product Page - Professional Implementation
 * Handles form submission, image uploads, and comprehensive validation
 */

class SellProductManager {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    // this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.selectedImages = [];
    this.maxImages = 5;
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.currentStep = 1;
    this.totalSteps = 3;
    this.validationRules = {
      sellerName: { min: 2, max: 100, required: true },
      sellerEmail: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      sellerPhone: { required: true, pattern: /^03\d{2}-?\d{7}$/ },
      city: { min: 2, max: 50, required: true },
      productName: { min: 3, max: 200, required: true },
      brand: { max: 100 },
      category: { required: true },
      condition: { required: true },
      price: { min: 1, max: 99999999, required: true },
      description: { min: 10, max: 2000, required: true }
    };
    
    this.init();
  }

  init() {
    console.log('🚀 Initializing Professional Sell Product Page...');
    this.setupEventListeners();
    this.loadCategories();
    this.initializeProgress();
    this.setupRealTimeValidation();
    
    // Test file input accessibility
    this.testFileInput();
  }

  testFileInput() {
    const fileInput = document.getElementById('productImage');
    if (fileInput) {
      console.log('✅ File input found and accessible');
      console.log('📄 File input properties:', {
        type: fileInput.type,
        accept: fileInput.accept,
        multiple: fileInput.multiple,
        name: fileInput.name
      });
    } else {
      console.error('❌ File input not found!');
    }
  }

  setupEventListeners() {
    // Form submission - ensure only one listener
    const form = document.getElementById('productForm');
    if (form) {
      // Remove any existing listeners
      form.onsubmit = null;
      
      // Add single event listener with proper error handling
      form.addEventListener('submit', (e) => {
        console.log('📝 Form submit event triggered');
        try {
          return this.handleFormSubmit(e);
        } catch (error) {
          console.error('❌ Error in form submit handler:', error);
          e.preventDefault();
          return false;
        }
      }, { once: false, passive: false });
      
      console.log('✅ Form submit listener attached');
    } else {
      console.error('❌ Form element not found');
    }

    // Enhanced image upload with better error handling
    this.setupImageUpload();

    // Price input formatting and validation
    this.setupPriceInput();

    // Real-time form validation
    this.setupFormProgression();
  }

  setupImageUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('productImage');
    const browseButton = document.getElementById('browseButton');

    if (!dropZone || !fileInput) {
      console.error('Image upload elements not found');
      return;
    }

    console.log('🖼️ Setting up image upload functionality...');

    // Remove any existing event listeners by setting a flag
    if (dropZone.dataset.initialized === 'true') {
      console.log('Image upload already initialized, skipping...');
      return;
    }
    dropZone.dataset.initialized = 'true';

    // Enhanced drag and drop with visual feedback
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
      dropZone.style.borderColor = '#2563eb';
      dropZone.style.backgroundColor = '#eff6ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only remove styles if we're leaving the dropzone itself
      if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('dragover');
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.backgroundColor = '#f9fafb';
      }
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
      dropZone.style.borderColor = '#d1d5db';
      dropZone.style.backgroundColor = '#f9fafb';
      
      const files = Array.from(e.dataTransfer.files);
      this.handleImageFiles(files);
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        console.log(`📁 Files selected: ${files.map(f => f.name).join(', ')}`);
        this.handleImageFiles(files);
      }
      // Reset input to allow same file selection again
      e.target.value = '';
    });

    // Browse button click handler
    if (browseButton) {
      browseButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 Browse button clicked');
        fileInput.click();
      });
    }

    // Dropzone click handler - simplified and more robust
    dropZone.addEventListener('click', (e) => {
      // Check if the click target is a remove button or browse button
      const isRemoveButton = e.target.classList.contains('remove-image-btn') || 
                           e.target.closest('.remove-image-btn');
      const isBrowseButton = e.target.id === 'browseButton' || 
                           e.target.closest('#browseButton');
      
      // If it's not a special button, trigger file input
      if (!isRemoveButton && !isBrowseButton) {
        console.log('📂 Dropzone clicked - opening file dialog');
        try {
          fileInput.click();
        } catch (error) {
          console.error('Error triggering file input:', error);
        }
      }
    });

    console.log('✅ Image upload setup completed');
  }

  setupPriceInput() {
    const priceInput = document.getElementById('price');
    if (!priceInput) return;

    // Remove any existing input restrictions
    priceInput.removeAttribute('maxlength');
    priceInput.setAttribute('min', '1');
    priceInput.setAttribute('max', '99999999');
    priceInput.setAttribute('step', '1');

    // Format price as user types with validation
    priceInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
      
      // Limit to 8 digits (99,999,999 max)
      if (value.length > 8) {
        value = value.substring(0, 8);
      }

      // Update input value
      e.target.value = value;

      // Real-time validation feedback
      this.validatePriceField(parseInt(value) || 0);

      // Update progress if valid
      this.checkProductInfoComplete();
    });

    // Blur event for final validation
    priceInput.addEventListener('blur', (e) => {
      const value = parseInt(e.target.value) || 0;
      this.validatePriceField(value);
    });
  }

  validatePriceField(value) {
    const priceInput = document.getElementById('price');
    const errorContainer = this.getOrCreateErrorContainer(priceInput);

    if (value < 1) {
      this.showFieldError(priceInput, 'Price must be at least ₨1');
      return false;
    } else if (value > 99999999) {
      this.showFieldError(priceInput, 'Price cannot exceed ₨99,999,999');
      return false;
    } else {
      this.clearFieldError(priceInput);
      return true;
    }
  }

  setupRealTimeValidation() {
    // Add real-time validation to all form fields
    Object.keys(this.validationRules).forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldId));
        field.addEventListener('input', () => {
          // Clear errors on input
          this.clearFieldError(field);
          // Debounced validation
          clearTimeout(this.validationTimeout);
          this.validationTimeout = setTimeout(() => {
            this.validateField(fieldId);
          }, 500);
        });
      }
    });
  }

  validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const rules = this.validationRules[fieldId];
    if (!field || !rules) return true;

    const value = field.value.trim();
    
    // Required field validation
    if (rules.required && !value) {
      this.showFieldError(field, `${this.getFieldLabel(fieldId)} is required`);
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      this.clearFieldError(field);
      return true;
    }

    // Length validations
    if (rules.min && value.length < rules.min) {
      this.showFieldError(field, `${this.getFieldLabel(fieldId)} must be at least ${rules.min} characters`);
      return false;
    }

    if (rules.max && value.length > rules.max) {
      this.showFieldError(field, `${this.getFieldLabel(fieldId)} cannot exceed ${rules.max} characters`);
      return false;
    }

    // Pattern validations
    if (rules.pattern && !rules.pattern.test(value)) {
      let message = `Please enter a valid ${this.getFieldLabel(fieldId)}`;
      if (fieldId === 'sellerEmail') {
        message = 'Please enter a valid email address';
      } else if (fieldId === 'sellerPhone') {
        message = 'Please enter a valid Pakistani phone number (03xx-xxxxxxx)';
      }
      this.showFieldError(field, message);
      return false;
    }

    // Special price validation
    if (fieldId === 'price') {
      const numValue = parseInt(value) || 0;
      return this.validatePriceField(numValue);
    }

    this.clearFieldError(field);
    return true;
  }

  getFieldLabel(fieldId) {
    const labels = {
      sellerName: 'Full Name',
      sellerEmail: 'Email Address',
      sellerPhone: 'Phone Number',
      city: 'City',
      productName: 'Product Name',
      brand: 'Brand',
      category: 'Category',
      condition: 'Condition',
      price: 'Price',
      description: 'Description'
    };
    return labels[fieldId] || fieldId;
  }

  showFieldError(field, message) {
    // Add error styling
    field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    field.classList.remove('border-gray-300', 'focus:ring-primary-500', 'focus:border-transparent');

    // Show error message
    const errorContainer = this.getOrCreateErrorContainer(field);
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }

  clearFieldError(field) {
    // Remove error styling
    field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    field.classList.add('border-gray-300', 'focus:ring-primary-500', 'focus:border-transparent');

    // Hide error message
    const errorContainer = this.getOrCreateErrorContainer(field);
    errorContainer.classList.add('hidden');
  }

  getOrCreateErrorContainer(field) {
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) return existingError;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-xs mt-1 hidden';
    field.parentElement.appendChild(errorDiv);
    return errorDiv;
  }

  setupFormProgression() {
    const personalFields = ['sellerName', 'sellerEmail', 'sellerPhone', 'city'];
    const productFields = ['productName', 'category', 'condition', 'price', 'description'];
    
    personalFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => this.checkPersonalInfoComplete());
        field.addEventListener('input', () => {
          clearTimeout(this.progressTimeout);
          this.progressTimeout = setTimeout(() => this.checkPersonalInfoComplete(), 300);
        });
      }
    });

    productFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('change', () => this.checkProductInfoComplete());
        field.addEventListener('input', () => {
          clearTimeout(this.progressTimeout);
          this.progressTimeout = setTimeout(() => this.checkProductInfoComplete(), 300);
        });
      }
    });
  }

  checkPersonalInfoComplete() {
    const personalFields = ['sellerName', 'sellerEmail', 'sellerPhone', 'city'];
    const allValid = personalFields.every(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field) return false;
      
      const value = field.value.trim();
      const rules = this.validationRules[fieldId];
      
      // Check if field meets minimum requirements
      if (rules.required && !value) return false;
      if (rules.min && value.length < rules.min) return false;
      if (rules.pattern && !rules.pattern.test(value)) return false;
      
      return true;
    });

    if (allValid && this.currentStep === 1) {
      this.updateProgress(2);
    }
  }

  checkProductInfoComplete() {
    const productFields = ['productName', 'category', 'condition', 'price', 'description'];
    const allValid = productFields.every(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field) return false;
      
      const value = field.value.trim();
      const rules = this.validationRules[fieldId];
      
      // Check if field meets minimum requirements
      if (rules.required && !value) return false;
      if (rules.min && value.length < rules.min) return false;
      if (fieldId === 'price') {
        const numValue = parseInt(value) || 0;
        return numValue >= 1 && numValue <= 99999999;
      }
      
      return true;
    });

    if (allValid && this.currentStep === 2) {
      this.updateProgress(3);
    }
  }

  handleImageFiles(files) {
    if (!files || files.length === 0) {
      console.log('No files provided to handleImageFiles');
      return;
    }

    console.log(`📁 Processing ${files.length} file(s)`);

    // Show processing feedback
    this.showImageProcessing(true);

    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      console.log(`📄 Processing file ${index + 1}: ${file.name} (${this.formatFileSize(file.size)})`);
      
      // Check file count
      if (this.selectedImages.length + validFiles.length >= this.maxImages) {
        errors.push(`Maximum ${this.maxImages} images allowed`);
        return;
      }

      // Validate file type with more comprehensive check
      if (!file.type.startsWith('image/') || !this.isValidImageType(file.type)) {
        errors.push(`${file.name} is not a valid image file. Please use JPG, PNG, GIF, or WebP format.`);
        console.log(`❌ Invalid file type: ${file.type}`);
        return;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        errors.push(`${file.name} is too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`);
        console.log(`❌ File too large: ${this.formatFileSize(file.size)}`);
        return;
      }

      // Check for duplicates by name and size
      const isDuplicate = this.selectedImages.some(img => 
        img.name === file.name && img.size === file.size
      );
      
      if (isDuplicate) {
        errors.push(`${file.name} is already selected`);
        console.log(`❌ Duplicate file: ${file.name}`);
        return;
      }

      console.log(`✅ File ${file.name} validated successfully`);
      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      const uniqueErrors = [...new Set(errors)];
      uniqueErrors.forEach(error => this.showNotification(error, 'error'));
    }

    // Process valid files
    if (validFiles.length > 0) {
      console.log(`📥 Adding ${validFiles.length} valid file(s)`);
      this.addValidFiles(validFiles);
    } else {
      console.log('❌ No valid files to add');
    }

    this.showImageProcessing(false);
  }

  isValidImageType(type) {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
    return validTypes.includes(type);
  }

  addValidFiles(files) {
    files.forEach(file => {
      this.selectedImages.push(file);
    });
    
    this.updateImagePreview();
    this.showNotification(`${files.length} image(s) added successfully`, 'success');

    // Update progress if this completes the form
    if (this.selectedImages.length > 0 && this.currentStep >= 2) {
      this.updateProgress(3);
    }
  }

  showImageProcessing(show) {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    if (show) {
      dropZone.style.opacity = '0.7';
      dropZone.style.pointerEvents = 'none';
    } else {
      dropZone.style.opacity = '1';
      dropZone.style.pointerEvents = 'auto';
    }
  }

  updateImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) {
      console.warn('Image preview container not found');
      return;
    }

    previewContainer.innerHTML = '';

    if (this.selectedImages.length === 0) {
      console.log('No images to preview');
      return;
    }

    console.log(`🖼️ Updating preview for ${this.selectedImages.length} image(s)`);

    this.selectedImages.forEach((file, index) => {
      try {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow';

        const img = document.createElement('img');
        
        // Create object URL with error handling
        try {
          img.src = URL.createObjectURL(file);
        } catch (error) {
          console.error(`Error creating object URL for ${file.name}:`, error);
          return; // Skip this image
        }
        
        img.className = 'w-24 h-24 object-cover';
        img.alt = file.name;
        img.loading = 'lazy';
        
        // Add error handling for image load
        img.onerror = () => {
          console.error(`Failed to load image: ${file.name}`);
          imageWrapper.remove();
        };

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-image-btn absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg z-10';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove image';
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          console.log(`🗑️ Removing image: ${file.name}`);
          this.removeImage(index);
        };

        const infoOverlay = document.createElement('div');
        infoOverlay.className = 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2';
        
        const fileName = document.createElement('div');
        fileName.className = 'text-white text-xs truncate font-medium';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'text-white/80 text-xs';
        fileSize.textContent = this.formatFileSize(file.size);

        const orderBadge = document.createElement('div');
        orderBadge.className = 'absolute top-2 left-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold';
        orderBadge.textContent = index + 1;

        infoOverlay.appendChild(fileName);
        infoOverlay.appendChild(fileSize);
        
        imageWrapper.appendChild(img);
        imageWrapper.appendChild(removeBtn);
        imageWrapper.appendChild(infoOverlay);
        imageWrapper.appendChild(orderBadge);
        
        previewContainer.appendChild(imageWrapper);
        
      } catch (error) {
        console.error(`Error creating preview for ${file.name}:`, error);
      }
    });

    // Update image count display
    this.updateImageCount();
  }

  updateImageCount() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    const countDisplay = dropZone.querySelector('.image-count') || document.createElement('p');
    countDisplay.className = 'image-count text-sm text-gray-600 mt-2';
    countDisplay.textContent = `${this.selectedImages.length}/${this.maxImages} images selected`;

    if (!dropZone.querySelector('.image-count')) {
      dropZone.appendChild(countDisplay);
    }
  }

  removeImage(index) {
    if (index >= 0 && index < this.selectedImages.length) {
      const removedFile = this.selectedImages[index];
      this.selectedImages.splice(index, 1);
      this.updateImagePreview();
      this.showNotification(`Removed ${removedFile.name}`, 'info');

      // Update progress
      if (this.selectedImages.length === 0 && this.currentStep === 3) {
        this.updateProgress(2);
      }
    }
  }

  initializeProgress() {
    this.updateProgress(1);
  }

  updateProgress(step) {
    this.currentStep = step;
    
    // Update progress steps with improved styling
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepElement = document.querySelector(`.progress-step:nth-child(${i * 2 - 1})`);
      const lineElement = document.querySelector(`.progress-line:nth-child(${i * 2})`);
      
      if (stepElement) {
        stepElement.classList.toggle('active', i <= step);
        stepElement.classList.toggle('completed', i < step);
      }
      
      if (lineElement && i < this.totalSteps) {
        lineElement.classList.toggle('active', i < step);
      }
    }

    // Update labels with smooth transition
    const labels = document.querySelectorAll('.progress-labels div');
    labels.forEach((label, index) => {
      const isActive = index + 1 <= step;
      label.classList.toggle('text-primary-600', isActive);
      label.classList.toggle('font-medium', isActive);
      label.classList.toggle('text-gray-600', !isActive);
    });
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      if (response.ok) {
        const data = await response.json();
        const categories = data.data.categories || data.data || [];
        this.populateCategories(categories);
      } else {
        console.warn('Failed to load categories from API, using defaults');
        this.useDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.useDefaultCategories();
    }
  }

  populateCategories(categories) {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    // Keep the first option and clear others
    const firstOption = categorySelect.firstElementChild;
    categorySelect.innerHTML = '';
    if (firstOption) {
      categorySelect.appendChild(firstOption);
    }

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  useDefaultCategories() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    // These match the backend enum exactly
    const defaultCategories = [
      'Electronics', 'Computers', 'Phones & Tablets', 'Furniture',
      'Clothing', 'Books', 'Vehicles', 'Antiques', 'Art', 'Jewelry', 'Collectibles', 'Art & Collectibles', 'Other'
    ];

    // Keep the first option and clear others
    const firstOption = categorySelect.firstElementChild;
    categorySelect.innerHTML = '';
    if (firstOption) {
      categorySelect.appendChild(firstOption);
    }

    defaultCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation(); // Add this to prevent event bubbling

    console.log('🚀 Form submission started');

    // Comprehensive validation before submission
    if (!this.validateCompleteForm()) {
      console.log('❌ Form validation failed');
      return false; // Explicitly return false
    }

    this.showLoading();

    try {
      const formData = this.buildFormData();
      
      console.log('📤 Submitting product with comprehensive validation...');

      const response = await fetch(`${this.baseURL}/product-submissions/submit`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (result.success) {
        console.log('✅ Submission successful, showing success modal');
        this.showSuccess(result.message, result.data.submissionId);
        
        // Delay the form reset to prevent immediate page reload
        setTimeout(() => {
          console.log('🔄 Resetting form after delay');
          this.resetForm();
        }, 1000);
      } else {
        console.log('❌ Submission failed:', result);
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach(error => this.showNotification(error, 'error'));
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      }

    } catch (error) {
      console.error('💥 Submission error:', error);
      this.showError(error.message || 'Failed to submit product. Please try again.');
    } finally {
      this.hideLoading();
    }

    return false; // Explicitly prevent form submission
  }

  validateCompleteForm() {
    let isValid = true;
    const errors = [];

    // Validate all text fields first
    Object.keys(this.validationRules).forEach(fieldId => {
      if (!this.validateField(fieldId)) {
        isValid = false;
      }
    });

    // Validate images separately to avoid native validation conflicts
    if (this.selectedImages.length === 0) {
      errors.push('At least one product image is required');
      isValid = false;
      
      // Add visual indication to drop zone
      const dropZone = document.getElementById('dropZone');
      if (dropZone) {
        dropZone.style.borderColor = '#ef4444';
        dropZone.style.backgroundColor = '#fef2f2';
        setTimeout(() => {
          dropZone.style.borderColor = '#d1d5db';
          dropZone.style.backgroundColor = '#f9fafb';
        }, 3000);
      }
    }

    if (this.selectedImages.length > this.maxImages) {
      errors.push(`Maximum ${this.maxImages} images allowed`);
      isValid = false;
    }

    // Validate terms checkbox
    const terms = document.getElementById('terms');
    if (!terms || !terms.checked) {
      errors.push('Please accept the terms and conditions');
      isValid = false;
    }

    // Show validation errors
    if (errors.length > 0) {
      errors.forEach(error => this.showNotification(error, 'error'));
    }

    // If validation fails, scroll to first error
    if (!isValid) {
      this.scrollToFirstError();
    }

    return isValid;
  }

  scrollToFirstError() {
    // Find first field with error styling
    const errorField = document.querySelector('.border-red-500') || 
                      document.getElementById('dropZone');
    
    if (errorField) {
      errorField.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Focus if it's an input
      if (errorField.tagName === 'INPUT' || errorField.tagName === 'TEXTAREA' || errorField.tagName === 'SELECT') {
        setTimeout(() => errorField.focus(), 500);
      }
    }
  }

  buildFormData() {
    const formData = new FormData();
    
    // Add text fields with trimming
    const fields = {
      sellerName: document.getElementById('sellerName').value.trim(),
      sellerEmail: document.getElementById('sellerEmail').value.trim().toLowerCase(),
      sellerPhone: document.getElementById('sellerPhone').value.trim(),
      city: document.getElementById('city').value.trim(),
      productName: document.getElementById('productName').value.trim(),
      brand: document.getElementById('brand').value.trim(),
      category: document.getElementById('category').value,
      condition: document.getElementById('condition').value,
      price: document.getElementById('price').value,
      description: document.getElementById('description').value.trim()
    };

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add images with proper naming
    this.selectedImages.forEach((file, index) => {
      formData.append('images', file);
    });

    return formData;
  }

  showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting Product...';
      submitBtn.classList.add('opacity-75');
    }
  }

  hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Submit Product';
      submitBtn.classList.remove('opacity-75');
    }
  }

  showSuccess(message, submissionId) {
    console.log('🎉 Showing success modal');
    
    // Prevent any potential page reload
    window.onbeforeunload = null;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
      // Only close if clicking the overlay, not the modal content
      if (e.target === modal) {
        this.closeSuccessModal(modal);
      }
    };
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center transform animate-bounce-in" onclick="event.stopPropagation()">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3">Success!</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Submission ID:</p>
          <p class="font-mono text-lg font-medium text-gray-800 break-all">${submissionId}</p>
          <button onclick="navigator.clipboard.writeText('${submissionId}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy ID', 2000)" 
                  class="mt-2 text-xs text-primary-600 hover:text-primary-700 underline">
            Copy ID
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-8">Save this ID to track your submission status. Our team will review your product within 24-48 hours.</p>
        <button onclick="window.sellProductManager.closeSuccessModal(this.closest('.fixed'))" 
                class="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Success modal displayed');
  }

  closeSuccessModal(modal) {
    console.log('🔒 Closing success modal');
    
    if (modal && modal.parentElement) {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Remove modal with animation
      modal.style.opacity = '0';
      setTimeout(() => {
        if (modal.parentElement) {
          modal.remove();
        }
      }, 300);
    }
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const icons = {
      success: 'fas fa-check',
      error: 'fas fa-exclamation-triangle',
      warning: 'fas fa-exclamation',
      info: 'fas fa-info'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl z-50 transform translate-x-full transition-all duration-300 max-w-sm`;
    notification.innerHTML = `
      <div class="flex items-start">
        <i class="${icons[type]} mr-3 mt-0.5 flex-shrink-0"></i>
        <div class="flex-1">
          <span class="text-sm">${message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200 flex-shrink-0">
          <i class="fas fa-times"></i>
        </button>
        </div>
      `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  resetForm() {
    const form = document.getElementById('productForm');
    if (form) {
      form.reset();
    }
    
    // Clear all field errors
    Object.keys(this.validationRules).forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        this.clearFieldError(field);
      }
    });
    
    this.selectedImages = [];
    this.updateImagePreview();
    this.updateProgress(1);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add page reload detection
  window.addEventListener('beforeunload', (e) => {
    console.log('⚠️ Page is about to reload/navigate');
    console.trace('Page reload stack trace');
  });
  
  // Prevent multiple initializations
  if (window.sellProductManager) {
    console.log('⚠️ SellProductManager already initialized');
    return;
  }
  
  // Add a small delay to ensure all elements are ready
  setTimeout(() => {
    console.log('🎯 Initializing SellProductManager...');
    window.sellProductManager = new SellProductManager();
    
    // Add global debug function
    window.testFileInput = () => {
      const fileInput = document.getElementById('productImage');
      if (fileInput) {
        console.log('🧪 Testing file input click...');
        fileInput.click();
        return 'File input clicked!';
      } else {
        console.error('❌ File input not found!');
        return 'File input not found!';
      }
    };
    
    console.log('🛠️ Debug: Type testFileInput() in console to test file upload manually');
    console.log('✅ SellProductManager initialized successfully');
  }, 100);
});

// Enhanced CSS for professional styling
const style = document.createElement('style');
style.textContent = `
  .progress-step {
    background: #e5e7eb;
    color: #6b7280;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
  }
  
  .progress-step.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .progress-step.completed {
    background: #10b981;
    border-color: #10b981;
  }
  
  .progress-line {
    height: 3px;
    background: #e5e7eb;
    transition: all 0.3s ease;
  }
  
  .progress-line.active {
    background: linear-gradient(90deg, #2563eb, #10b981);
  }
  
  .image-upload-area {
    border: 2px dashed #d1d5db;
    background: #f9fafb;
    transition: all 0.3s ease;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .image-upload-area:hover {
    border-color: #2563eb;
    background: #eff6ff;
    transform: scale(1.01);
  }
  
  .image-upload-area.dragover {
    border-color: #2563eb;
    background: #eff6ff;
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
  }

  .image-upload-area * {
    pointer-events: none;
  }

  .image-upload-area button {
    pointer-events: auto;
  }

  @keyframes bounce-in {
    0% { transform: scale(0.8) translateY(-50px); opacity: 0; }
    50% { transform: scale(1.05) translateY(0); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }

  .field-error {
    animation: shake 0.3s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  /* Enhanced form styling */
  .form-group {
    position: relative;
  }

  .form-input:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }

  .remove-image-btn {
    transition: all 0.2s ease;
  }

  .remove-image-btn:hover {
    transform: scale(1.1);
  }
`;
document.head.appendChild(style); 