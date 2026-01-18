    // Initializing numbers
    let wishlistItemsCount = 0;
    let cartItemsCount = 0;
    let isProductInWishlist = false;
    // NEW VARIABLE TO FIND IF THE PRODUCT HAS BEEN ADDED TO THE CART
    let isProductAddedToCart = false; 
    // DOM elements
    const productWishlistBtn = document.getElementById('product-wishlist-button');
    const productHeartIcon = productWishlistBtn.querySelector('i');
    const headerWishlistIcon = document.getElementById('header-wishlist-icon');
    const wishlistCountBadge = document.getElementById('wishlist-count');
    const addToCartButton = document.getElementById('add-to-cart-button');
    const cartCountBadge = document.getElementById('cart-count');
    const quantityInput = document.getElementById('quantity');
    const increaseBtn = document.getElementById('increase');
    const decreaseBtn = document.getElementById('decrease');
    // NEW MESSAGE ELEMENT
    const cartInfoMessage = document.getElementById('cart-info-message'); 
    // Gallery Elements
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const prevArrow = document.getElementById('prev-arrow');
    const nextArrow = document.getElementById('next-arrow');
    const imageSources = Array.from(thumbnails).map(img => img.src);
    let currentIndex = 0; 
    
    // MESSAGE SHOW/HIDE FUNCTION
    function displayCartMessage(message, isError = false) {
        cartInfoMessage.textContent = message;
        cartInfoMessage.classList.remove('error-message'); // Adding a styling class
        if (isError) {
             cartInfoMessage.classList.add('error-message');
        } else {
             cartInfoMessage.classList.remove('error-message');
        }
        cartInfoMessage.classList.add('show');

        // Remove message after 3 seconds
        setTimeout(() => {
            cartInfoMessage.classList.remove('show');
        }, 3000); 
    }
    
    // --- 1. Heart Functionality (Wishlist Toggle) ---
    productWishlistBtn.addEventListener('click', function() {
        if (!isProductInWishlist) {
            // Add to Wishlist
            productHeartIcon.classList.remove('fa-regular');
            productHeartIcon.classList.add('fa-solid');
            productHeartIcon.style.color = 'red'; 

            wishlistItemsCount++;
            wishlistCountBadge.textContent = wishlistItemsCount;
            wishlistCountBadge.style.display = 'block'; 
            
            // Make the header icon filled
            headerWishlistIcon.classList.remove('fa-regular');
            headerWishlistIcon.classList.add('fa-solid');
            
            isProductInWishlist = true;

        } else {
            // Removing from Wishlist
            productHeartIcon.classList.remove('fa-solid');
            productHeartIcon.classList.add('fa-regular');
            productHeartIcon.style.color = ''; // Return to default color

            wishlistItemsCount--;
            wishlistCountBadge.textContent = wishlistItemsCount;
            // Hide the badge if the number is 0
            wishlistCountBadge.style.display = wishlistItemsCount > 0 ? 'block' : 'none';
            
            // Turn header icon into outline (if list is empty)
            if (wishlistItemsCount === 0) {
                 headerWishlistIcon.classList.remove('fa-solid');
                 headerWishlistIcon.classList.add('fa-regular');
            }

            isProductInWishlist = false;
        }
    });

    // --- 2. Cart Functionality ---
    addToCartButton.addEventListener('click', function() {
        const quantityToAdd = parseInt(quantityInput.value);
        
        if (isProductAddedToCart) {
            // Show message on second click
            displayCartMessage('⚠️ The product has already been added to the Cart.');
            return; // Stop further execution
        }
        
        if (quantityToAdd > 0) {
            cartItemsCount += quantityToAdd;
            cartCountBadge.textContent = cartItemsCount;
            cartCountBadge.style.display = 'block'; 
            
            // Show success message
            displayCartMessage(`✅ ${quantityToAdd} product added to Cart!`);

            isProductAddedToCart = true; // Mark that the product has been added.

        } else {
            // Manage the case when the quantity is 0
             displayCartMessage('❌ The quantity must be at least 1.', true);
        }
    });

    // --- 3. Counter functionality (+ / -) ---
    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        // To allow the message to reappear if the quantity changes 
        // after the first addition (optional, if you don't want to return the quantity to 1)
        // isProductAddedToCart = false; 
    });

    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        // Make sure the quantity does not fall below 1
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            // isProductAddedToCart = false; // See note above.
        }
    });

    // --- 4. Gallery functionality ---
    function changeImage(index) {
        if (index >= imageSources.length) {
            currentIndex = 0; 
        } else if (index < 0) {
            currentIndex = imageSources.length - 1; 
        } else {
            currentIndex = index;
        }
        mainImage.src = imageSources[currentIndex];
        
        // Stylization of miniatures 
        thumbnails.forEach(img => img.classList.remove('active-thumbnail'));
        thumbnails[currentIndex].classList.add('active-thumbnail');
    }

    // Event Listeners for arrows
    nextArrow.addEventListener('click', () => {
        changeImage(currentIndex + 1);
    });

    prevArrow.addEventListener('click', () => {
        changeImage(currentIndex - 1);
    });

    // Event Listener for thumbnail click
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            changeImage(index);
        });
    });

    changeImage(0); // The first image as a starting point