

const OWNER_EMAIL = 'naminathtravels22@gmail.com';

document.addEventListener('DOMContentLoaded', () => {

    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && mainNav) {
        
        mobileToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            mobileToggle.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('is-open')) {
                    mainNav.classList.remove('is-open');
                    mobileToggle.setAttribute('aria-expanded', false);
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }

    const sections = document.querySelectorAll('section[id], footer[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; 
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

            if (correspondingLink) {
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    });

    const vehicleTrackContainer = document.getElementById('vehicles-track-container');
    const prevVehicleBtn = document.getElementById('vehicles-prev');
    const nextVehicleBtn = document.getElementById('vehicles-next');
    const vehicleSelect = document.getElementById('vehicle_type');

    if (vehicleTrackContainer && prevVehicleBtn && nextVehicleBtn) {
        const scrollAmount = 260; 

        prevVehicleBtn.addEventListener('click', () => {
            vehicleTrackContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextVehicleBtn.addEventListener('click', () => {
            vehicleTrackContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const vehicleName = card.getAttribute('data-vehicle-name');
            if (vehicleName && vehicleSelect) {
                
                let matched = false;
                for (let i = 0; i < vehicleSelect.options.length; i++) {
                    if (vehicleSelect.options[i].value === vehicleName) {
                        vehicleSelect.selectedIndex = i;
                        matched = true;
                        break;
                    }
                }

                vehicleSelect.classList.add('highlight-pulse');
                setTimeout(() => vehicleSelect.classList.remove('highlight-pulse'), 1000);

                const bookingCard = document.getElementById('booking-card');
                if (bookingCard) {
                    bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }

                showToast(`Selected ${vehicleName} for your booking!`);
            }
        });
    });

    const galleryTrack = document.getElementById('gallery-track');
    const galleryNextBtn = document.getElementById('gallery-next');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const galleryModal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalClose = document.getElementById('modal-close');

    if (galleryNextBtn && galleryTrack) {
        galleryNextBtn.addEventListener('click', () => {
            const firstCard = galleryTrack.firstElementChild;
            if (firstCard) {
                galleryTrack.appendChild(firstCard);
            }
        });
    }

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.gallery-img');
            const caption = card.querySelector('.gallery-caption');
            if (img && galleryModal && modalImg) {
                modalImg.src = img.src;
                modalCaption.textContent = caption ? caption.textContent : '';
                galleryModal.classList.add('show');
                galleryModal.setAttribute('aria-hidden', 'false');
            }
        });
    });

    if (modalClose && galleryModal) {
        modalClose.addEventListener('click', () => {
            galleryModal.classList.remove('show');
            galleryModal.setAttribute('aria-hidden', 'true');
        });

        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.remove('show');
                galleryModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const bookingForm = document.getElementById('booking-form');
    const bookingAlert = document.getElementById('booking-alert');
    const submitBtn = document.getElementById('btn-submit-booking');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
            const pickup = document.getElementById('pickup').value.trim();
            const destination = document.getElementById('destination').value.trim();
            const travelDate = document.getElementById('travel_date').value.trim();
            const vehicleType = document.getElementById('vehicle_type').value;

            if (!name || !mobile || !email || !pickup || !destination || !travelDate || !vehicleType) {
                showAlert('Please fill in all required fields.', 'danger');
                return;
            }

            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Email...</span>';

            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const bookingId = `BK-${dateStr}-${randSuffix}`;
            const message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';
            const nowFormatted = new Date().toLocaleString();

            const newBooking = {
                id: bookingId,
                name: name,
                mobile: mobile,
                email: email,
                pickup: pickup,
                destination: destination,
                travel_date: travelDate,
                vehicle_type: vehicleType,
                message: message,
                created_at: nowFormatted,
                status: 'Pending' 
            };

            try {
                const stored = JSON.parse(localStorage.getItem('safe_journeys_bookings')) || [];
                stored.unshift(newBooking); 
                localStorage.setItem('safe_journeys_bookings', JSON.stringify(stored));
            } catch (err) {
                console.error('Local storage save error:', err);
            }

            const emailSubject = `New Booking Request [Pending Approval]: ${bookingId} - ${name} (${vehicleType})`;
            const emailBody = `======================================================\n` +
                `NEW RIDE BOOKING INQUIRY - PENDING APPROVAL\n` +
                `Safe Journeys Happy Memories\n` +
                `======================================================\n\n` +
                `A customer has submitted a new booking inquiry on the website:\n\n` +
                `CUSTOMER DETAILS:\n` +
                `------------------------------------------------------\n` +
                `• Full Name          : ${name}\n` +
                `• Mobile Number      : ${mobile}\n` +
                `• Email Address      : ${email}\n\n` +
                `TRIP & VEHICLE DETAILS:\n` +
                `------------------------------------------------------\n` +
                `• Booking ID         : ${bookingId}\n` +
                `• Status             : PENDING ADMIN APPROVAL\n` +
                `• Travel Date        : ${travelDate}\n` +
                `• Selected Vehicle   : ${vehicleType}\n` +
                `• Pickup Location    : ${pickup}\n` +
                `• Destination        : ${destination}\n` +
                `• Special Notes      : ${message || 'None'}\n` +
                `• Submission Time    : ${nowFormatted}\n\n` +
                `======================================================\n` +
                `ACTION REQUIRED BY ADMIN:\n` +
                `Please open admin.html to review and APPROVE this ride.\n` +
                `Once you click 'Approve & Email' in admin.html, a confirmed\n` +
                `itinerary email will automatically be sent to ${email}.\n` +
                `======================================================`;

            try {
                
                const customerReceiptHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                        <div style="background: linear-gradient(135deg, #0b1e34 0%, #173256 100%); color: #ffffff; padding: 24px; text-align: center;">
                            <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Naminath Travels</h2>
                            <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Ride Booking Inquiry Registered</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${name}</strong>,</p>
                            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for booking with Naminath Travels! Your ride inquiry has been successfully registered. Below are the complete details of what you booked:</p>
                            
                            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
                                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Booking Reference ID</span>
                                <div style="font-size: 18px; font-weight: bold; color: #ea580c; font-family: monospace;">${bookingId}</div>
                                <div style="font-size: 12px; color: #854d0e; background: #fef9c3; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; font-weight: 600;">Status: Pending Admin Approval</div>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 18px 0;">
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; width: 40%;">Passenger Name</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${name}</td></tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Contact Mobile</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${mobile}</td></tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Vehicle Reserved</td><td style="padding: 10px 0; color: #0284c7; font-weight: 600;">${vehicleType}</td></tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Date of Travel</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${travelDate}</td></tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Pickup Location</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${pickup}</td></tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Destination</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${destination}</td></tr>
                                ${message ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Special Notes</td><td style="padding: 10px 0; color: #0f172a; font-style: italic;">"${message}"</td></tr>` : ''}
                            </table>

                            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; font-size: 13px; color: #1e40af; line-height: 1.5;">
                                <strong>What happens next?</strong><br>
                                Our administration team is reviewing your ride. Once approved, you will receive an official confirmation with driver assignment.
                            </div>

                            <p style="font-size: 13px; color: #64748b; margin-top: 18px;">Emergency / Fast Support Helpline: <strong>+91 91065 19219</strong></p>
                        </div>
                        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                            Naminath Travels &bull; Ahmedabad, Gujarat
                        </div>
                    </div>
                `;

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: email,
                        toName: name,
                        subject: `Booking Request Received: ${bookingId} - ${vehicleType} | Naminath Travels`,
                        htmlContent: customerReceiptHtml,
                        textContent: emailBody,
                        replyTo: OWNER_EMAIL
                    })
                }).catch(e => console.log('Brevo customer dispatch:', e));

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: OWNER_EMAIL,
                        toName: 'Safe Journeys Admin',
                        subject: emailSubject,
                        textContent: emailBody,
                        replyTo: email
                    })
                }).catch(e => console.log('Brevo owner dispatch:', e));
            } catch (err) {
                console.log('Brevo auto-dispatch note:', err.message);
            }

            try {
                const storedCfg = JSON.parse(localStorage.getItem('safe_journeys_email_config') || '{}');
                const emailjsPublic = storedCfg.emailjsPublic || '';
                const emailjsService = storedCfg.emailjsService || '';
                const emailjsTemplate = storedCfg.emailjsTemplate || '';

                if (emailjsPublic && emailjsService && emailjsTemplate && typeof emailjs !== 'undefined') {
                    emailjs.init(emailjsPublic.trim());

                    emailjs.send(emailjsService.trim(), emailjsTemplate.trim(), {
                        to_email: email,
                        to_name: name,
                        booking_id: bookingId,
                        vehicle_type: vehicleType,
                        travel_date: travelDate,
                        pickup: pickup,
                        destination: destination,
                        mobile: mobile,
                        message: emailBody,
                        subject: `Booking Request Received: ${bookingId} - ${vehicleType}`,
                        reply_to: OWNER_EMAIL
                    }).catch(e => console.log('EmailJS customer dispatch:', e));

                    emailjs.send(emailjsService.trim(), emailjsTemplate.trim(), {
                        to_email: OWNER_EMAIL,
                        to_name: 'Safe Journeys Admin',
                        booking_id: bookingId,
                        vehicle_type: vehicleType,
                        travel_date: travelDate,
                        pickup: pickup,
                        destination: destination,
                        mobile: mobile,
                        message: emailBody,
                        subject: emailSubject,
                        reply_to: email
                    }).catch(e => console.log('EmailJS owner dispatch:', e));
                }
            } catch (err) {
                console.log('EmailJS auto-dispatch note:', err.message);
            }

            try {
                
                fetch('https://formsubmit.co/ajax/' + encodeURIComponent(OWNER_EMAIL), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: `New Ride Booking [Pending Approval]: ${bookingId} - ${name} (${vehicleType})`,
                        _template: 'table',
                        _captcha: 'false',
                        _cc: email,
                        _replyto: email,
                        'Booking Reference ID': bookingId,
                        'Booking Status': 'PENDING ADMIN APPROVAL',
                        'Customer Full Name': name,
                        'Customer Mobile': mobile,
                        'Customer Email': email,
                        'Pickup Location': pickup,
                        'Destination Location': destination,
                        'Date of Travel': travelDate,
                        'Selected Vehicle': vehicleType,
                        'Special Instructions / Remarks': message || 'None',
                        'Submission Timestamp': nowFormatted
                    })
                }).catch(e => console.log('FormSubmit owner dispatch:', e));

                fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: `Booking Request Confirmed: ${bookingId} - ${vehicleType} | Safe Journeys`,
                        _template: 'table',
                        _captcha: 'false',
                        _cc: OWNER_EMAIL,
                        _replyto: OWNER_EMAIL,
                        'Booking Status': 'PENDING ADMIN APPROVAL',
                        'Booking Reference ID': bookingId,
                        'Passenger Name': name,
                        'Passenger Phone': mobile,
                        'Passenger Email': email,
                        'Date of Travel': travelDate,
                        'Vehicle Reserved': vehicleType,
                        'Pickup Location': pickup,
                        'Destination': destination,
                        'Special Instructions': message || 'None',
                        'Important Notice': 'Thank you for booking with Safe Journeys! Our administration will review and confirm your ride shortly.'
                    })
                }).catch(e => console.log('FormSubmit customer dispatch:', e));
            } catch (err) {
                console.log('Background mail service note:', err.message);
            }

            showAlert(`
                <strong><i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> Booking Request Received! (${bookingId})</strong><br>
                Thank you, <strong>${name}</strong>! Your ride request has been registered successfully.<br>
                <small style="color: #64748b; display: block; margin-top: 6px;">
                    <i class="fa-regular fa-envelope"></i> Our team will review your booking and send your confirmed trip itinerary to <strong>${email}</strong> shortly.
                </small>
            `, 'success');

            showToast(`Booking ${bookingId} submitted - Pending Approval`);

            showBookingReceiptModal({
                id: bookingId,
                name: name,
                mobile: mobile,
                email: email,
                pickup: pickup,
                destination: destination,
                travel_date: travelDate,
                vehicle_type: vehicleType,
                message: message,
                created_at: nowFormatted
            });

            bookingForm.reset();

            const dateInput = document.getElementById('travel_date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        });
    }

    function showAlert(htmlMsg, type) {
        if (!bookingAlert) return;
        bookingAlert.innerHTML = htmlMsg;
        bookingAlert.className = `booking-alert alert-${type}`;
        bookingAlert.style.display = 'block';
    }

    const toast = document.getElementById('booking-toast');
    const toastMessage = document.getElementById('toast-message');
    const toastClose = document.getElementById('toast-close');
    let toastTimeout = null;

    window.showToast = function (msg) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = msg;
        toast.classList.add('show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    };

    if (toastClose && toast) {
        toastClose.addEventListener('click', () => {
            toast.classList.remove('show');
            if (toastTimeout) clearTimeout(toastTimeout);
        });
    }

    function showBookingReceiptModal(data) {
        const modal = document.getElementById('booking-receipt-modal');
        if (!modal) return;

        const setField = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '—';
        };

        setField('receipt-booking-id', data.id);
        setField('receipt-passenger-name', data.name);
        setField('receipt-passenger-phone', data.mobile);
        setField('receipt-passenger-email', data.email);
        setField('receipt-vehicle', data.vehicle_type);
        setField('receipt-pickup', data.pickup);
        setField('receipt-destination', data.destination);
        setField('receipt-date', data.travel_date);
        setField('receipt-time', data.created_at);
        setField('receipt-notice-email', data.email);

        const notesBox = document.getElementById('receipt-instructions-box');
        const notesText = document.getElementById('receipt-instructions-text');
        if (notesBox && notesText) {
            if (data.message && data.message.trim()) {
                notesText.textContent = `"${data.message.trim()}"`;
                notesBox.style.display = 'block';
            } else {
                notesBox.style.display = 'none';
            }
        }

        const waLink = document.getElementById('receipt-whatsapp-link');
        if (waLink) {
            const text = encodeURIComponent(`Hello Safe Journeys, I have submitted a booking (${data.id}) for ${data.vehicle_type} on ${data.travel_date}. Route: ${data.pickup} to ${data.destination}.`);
            waLink.href = `https://wa.me/919106519219?text=${text}`;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    window.closeBookingReceiptModal = function () {
        const modal = document.getElementById('booking-receipt-modal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    window.copyReceiptBookingId = function () {
        const idEl = document.getElementById('receipt-booking-id');
        const btn = document.getElementById('btn-copy-receipt-id');
        if (!idEl) return;
        navigator.clipboard.writeText(idEl.textContent.trim()).then(() => {
            if (btn) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
                btn.style.borderColor = '#16a34a';
                btn.style.color = '#16a34a';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 2500);
            }
        }).catch(() => {
            alert('Booking ID: ' + idEl.textContent.trim());
        });
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeBookingReceiptModal();
        }
    });

    const receiptModal = document.getElementById('booking-receipt-modal');
    if (receiptModal) {
        receiptModal.addEventListener('click', (e) => {
            if (e.target === receiptModal) {
                window.closeBookingReceiptModal();
            }
        });
    }
});

