import countries from './countryCodes.json' assert { type: 'json' };
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

window.onload = function() {
    const selectContent    = document.querySelector('#select-content');
    const openCountrySelect= document.querySelector('#open-country-select');
    const selectContainer  = document.querySelector('#select-container');
    const selectedCountry  = document.querySelector('#selected-country');
    const searchCountry    = document.querySelector('#search-country');
    const phoneInput       = document.querySelector('#phone');
    const contactForm      = document.querySelector('#contact-form');
    const successMessage   = document.querySelector('#success-message');
    const errorMessage     = document.querySelector('#error-message');
    const submittedData    = document.querySelector('#submitted-data');

    // Phone Numbers (with and without mask)
    let rawFormat = "";       
    let nationalFormat = "";
    let isPhoneValid = false;

    // Populate Country Codes Select
    countries.forEach((country) => {
        selectContent.innerHTML += `
            <div data-dial-code="${country.dial_code}" data-country-code="${country.code}" class="flex items-center gap-4 w-full bg-gray-100 hover:bg-gray-200 p-1 rounded cursor-pointer">
                <div class="w-6 h-4 rounded-sm shadow-sm bg-green-300" style="background: url('https://flagsapi.com/${country.code}/shiny/24.png') no-repeat center center;"></div>
                <div class="flex flex-col">
                    <p class="text-sm font-medium line-clamp-1">${country.name}</p>
                    <span class="text-xs text-gray-500">${country.dial_code}</span>
                </div>
            </div>
        `;
    });
    
    // Test if the phone number is valid and apply masks
    function updatePhoneNumber() {
        const dialCode = selectedCountry.value;
        const digitsOnly = phoneInput.value.replace(/\D/g, '');

        const phoneToParse = dialCode + digitsOnly;

        if(digitsOnly.length > 1) {
            try {
                const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneToParse);
                isPhoneValid = phoneUtil.isValidNumber(parsedNumber);
    
                if (isPhoneValid) {
                    rawFormat = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164); 
                    nationalFormat = phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);
    
                    phoneInput.value = nationalFormat;
                    phoneInput.classList.remove('border-red-500');
                    errorMessage.classList.add('hidden');
                } else {
                    phoneInput.classList.add('border-red-500');
                    isPhoneValid = false;
                }
            } catch (error) {
                console.error('Error parsing number:', error);
                phoneInput.classList.add('border-red-500');
                isPhoneValid = false;
            }
        } else {
            isPhoneValid = false;
        }

        console.log('Raw Format:', rawFormat);
        console.log('National Format:', nationalFormat);
        console.log('Is Valid:', isPhoneValid);
    }

    // Custom Select Events
    document.querySelectorAll('#select-content > div').forEach(countryItem => {
        countryItem.addEventListener('click', () => {
            const flagDiv = openCountrySelect.querySelector('div');
            const code    = countryItem.getAttribute('data-country-code');
            flagDiv.style.background = `url('https://flagsapi.com/${code}/shiny/24.png') no-repeat center center`;

            const dial_code = countryItem.getAttribute('data-dial-code');
            const spanDial  = openCountrySelect.querySelector('span');
            spanDial.textContent = dial_code;
            selectedCountry.value = dial_code;

            selectContainer.classList.add('hidden');

            updatePhoneNumber();
        });
    });

    openCountrySelect.addEventListener('click', (e) => {
        selectContainer.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        const isClickInside = selectContainer.contains(e.target) || openCountrySelect.contains(e.target);
        if (!isClickInside) {
            selectContainer.classList.add('hidden');
        }
    });

    function renderCountries(list) {
        selectContent.innerHTML = "";
        list.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = "flex items-center gap-4 w-full bg-gray-100 hover:bg-gray-200 p-1 rounded cursor-pointer";
            countryItem.setAttribute('data-dial-code', country.dial_code);
            countryItem.setAttribute('data-country-code', country.code);

            countryItem.innerHTML = `
                <div class="w-6 h-4 rounded-sm shadow-sm bg-green-300" style="background: url('https://flagsapi.com/${country.code}/shiny/24.png') no-repeat center center;"></div>
                <div class="flex flex-col">
                    <p class="text-sm font-medium line-clamp-1">${country.name}</p>
                    <span class="text-xs text-gray-500">${country.dial_code}</span>
                </div>
            `;

            countryItem.addEventListener('click', () => {
                const flagDiv = openCountrySelect.querySelector('div');
                const code = countryItem.getAttribute('data-country-code');
                flagDiv.style.background = `url('https://flagsapi.com/${code}/shiny/24.png') no-repeat center center`;

                const dial_code = countryItem.getAttribute('data-dial-code');
                const spanDial  = openCountrySelect.querySelector('span');
                spanDial.textContent     = dial_code;
                selectedCountry.value    = dial_code;

                selectContainer.classList.add('hidden');

                rawFormat = "";       
                nationalFormat = ""; 
                updatePhoneNumber(); 
            });

            selectContent.appendChild(countryItem);
        });
    }

    // Select Search Countries Debounce
    let debounceTimer;
    searchCountry.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const searchValue = e.target.value.trim().toLowerCase();

        debounceTimer = setTimeout(() => {
            if (!searchValue) {
                renderCountries(countries);
            } else {
                const filtered = countries.filter(country => 
                    country.name.toLowerCase().includes(searchValue)
                );
                renderCountries(filtered);
            }
        }, 300);
    });

    phoneInput.addEventListener('input', function() {
        updatePhoneNumber();
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hide previous messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        submittedData.classList.add('hidden');

        // Validate phone number
        if (!isPhoneValid) {
            errorMessage.classList.remove('hidden');
            phoneInput.focus();
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phoneE164: rawFormat,
            phoneNational: nationalFormat,
            message: document.getElementById('message').value
        };

        // Display submitted data
        document.getElementById('display-name').textContent = formData.name;
        document.getElementById('display-email').textContent = formData.email;
        document.getElementById('display-phone-e164').textContent = formData.phoneE164;
        document.getElementById('display-phone-national').textContent = formData.phoneNational;
        document.getElementById('display-message').textContent = formData.message;

        // Show success message and data
        successMessage.classList.remove('hidden');
        submittedData.classList.remove('hidden');

        // Log to console (in production, you would send this to your API)
        console.log('Form submitted with data:', formData);

        // Optional: Reset form after submission
        // contactForm.reset();
        // phoneInput.classList.remove('border-red-500');
    });
};
