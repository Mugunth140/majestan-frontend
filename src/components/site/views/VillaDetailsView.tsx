import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<script src="https://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


<script>
   $(document).ready(function () {


    $('#enquiryforms').validate({
         rules: {
        name: { 
            required: true 
        },
        mobileno: { 
            required: true,
            digits: true,
            minlength: 10,
            maxlength: 10
        },
        email: { 
            required: true,
            email: true
        },
        requirement: { 
            required: true 
        }
    },
    messages: {
        name: {
            required: "Please enter your name."
        },
        mobileno: {
            required: "Please enter your mobile number.",
            digits: "Only numbers are allowed.",
            minlength: "Mobile number must be exactly 10 digits.",
            maxlength: "Mobile number must be exactly 10 digits."
        },
        email: {
            required: "Please enter your email.",
            email: "Please enter a valid email address."
        },
        requirement: {
            required: "This field is required."
        }
    },
        errorPlacement: function (error, element) {
            if (element.is(":radio")) {
                error.appendTo(element.parents('.form-group'));
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function (form) {
            var datastring = new FormData(form);
            
            const enteredCaptcha = $('#captchaInput1').val().trim();

                if (enteredCaptcha !== currentCaptcha1) {
                    $('#captchaError1').show();
                    showCaptcha1();
                    return false;
                } else {
                    $('#captchaError1').hide();
                }
                
            $.ajax({
                type: "POST",
                url: "/Home/insertenquiry",
                data: datastring,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    $('#btnSave1').attr('disabled', true).text('Processing...');
                },
                success: function (data) {
                    if (data === 'Yes') {
                        Swal.fire({
                            icon: "success",
                            title: "Success",
                             text: "Enquiry Submitted Successfully. Our team will contact you soon!!!",
                            confirmButtonColor: "#28a745",
                        }).then(() => {
                            $('#modalEnquires').modal('hide'); 
                            
                                $('#enquiryforms').validate().resetForm();
                                showCaptcha1();
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Something went wrong. Please try again!",
                            confirmButtonColor: "#d33",
                        });
                    }
                    $('#btnSave1').attr('disabled', false).text('Get a Call Back');
                },
                error: function () {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Server error! Please try again later.",
                        confirmButtonColor: "#d33",
                    });
                    $('#btnSave1').attr('disabled', false).text('Get a Call Back');
                }
            });
        }
    });
  $('#expertcontact').validate({
        rules: {
            name: { required: true },
            phone: { required: true, digits: true, minlength: 10, maxlength: 10 },
            email: { required: true, email: true }
        },
        messages: {
            name: { required: "Please enter your name." },
            phone: { required: "Please enter your mobile number.", digits: "Only numbers allowed.", minlength: "Must be 10 digits.", maxlength: "Must be 10 digits." },
            email: { required: "Please enter your email.", email: "Enter a valid email address." }
        },
        submitHandler: function (form, event) {
            event.preventDefault(); // Prevent form submission

            var interests = [];
            $("input[type='checkbox']:checked").each(function () {
                interests.push($(this).val());
            });

            var formData = $('#expertcontact').serialize() + "&interests=" + interests.join(", ");
            const enteredCaptcha1 = $('#captchaInput2').val().trim();

                if (enteredCaptcha1 !== currentCaptcha2) {
                    $('#captchaError2').show();
                    showCaptcha2();
                    return false;
                } else {
                    $('#captchaError2').hide();
                }

            $.ajax({
                type: "POST",
                url: "/Home/insertenquiry",
                data: formData,
                beforeSend: function () {
                    $('.contact_expert').attr('disabled', true).text('Processing...');
                },
                success: function (response) {
                    if (response === 'Yes') {
                        Swal.fire({ icon: "success", title: "Success", text: "Email sent successfully!", confirmButtonColor: "#28a745" }).
                            then(() => {
                                    $('#expertcontact')[0].reset(); // Reset form
                                    $('#expertcontact').validate().resetForm();
                                    showCaptcha2();
                                    $('.contact_expert').attr('disabled', false).text('Send Message');
                                });
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: "Email sending failed.", confirmButtonColor: "#d33" });
                    }
                    $('.contact_expert').attr('disabled', false).text('Send Message');
                },
                error: function () {
                    Swal.fire({ icon: "error", title: "Error", text: "Server error! Please try again later.", confirmButtonColor: "#d33" });
                   $('.contact_expert').attr('disabled', false).text('Send Message');
                }
            });
        }
    });

    
});


function isNumberKey(evt) {
var charCode = (evt.which) ? evt.which : event.keyCode
if (charCode > 31 && (charCode < 48 || charCode > 57))
return false;
return true;
}

 function shareOnWhatsApp() {
    var pageUrl = window.location.href; // Get current URL
    var whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(pageUrl);

    window.open(whatsappUrl, "_blank"); // Open WhatsApp share link
}

$('.strconvert').each(function () {
    if ($(this).children().length) {
        return;
    }
    let text = $(this).text().toLowerCase(); // make all lowercase first
    let formatted = text.replace(/\\b\\w/g, function (match) {
        return match.toUpperCase(); // capitalize first letter of each word
    });
    $(this).text(formatted);
});


</script>

<script>
            $(document).ready(function () {
                updateWishlistCount();
            })

            function updateWishlistCount() {
                $.ajax({
                    url: '/Apartment/get_wishlist_count',
                    type: 'GET',
                    dataType: 'json',
                    success: function (response) {
                        if (response.success && response.cart_count > 0) {
                            $('.wishlist-count-border').text(response.cart_count).show();
                        } else {
                           $('.wishlist-count-border').hide();
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error loading wishlist count:', error);
                    }
                });
            }
            $(document).on('click', '.wishlist', function (e) {
                e.preventDefault();

                var $this = $(this);
                var productId = $this.data('product-id');
                var propertyType = $this.data('property');

                $.ajax({
                    url: '/Apartment/wishlist',
                    type: 'POST',
                    data: {
                        property_id: productId,
                        property_type: propertyType
                    },
                    dataType: 'json',
                    success: function (response) {
                        updateWishlistCount();
                        if (response.success) {
                            if (response.action === 'added') {
                                $this.addClass('active');
                            } else {
                                $this.removeClass('active');
                          
                            }

                            $('#wishlist-count').text(response.wishlist_count);
                        } else {
                            
                        }
                    },
                    error: function () {
                      
                    }
                });
            });

        </script>
        
        
        <style>
        
        .sticky-sidebar {
  position: sticky;
  top: 80px;
}
#captchaCanvas2{
        padding: 6px 0px;
    }
    #captchaCanvas1{
        padding: 6px 12px;
    }
    
    
    #captchaCanvas1,
    #captchaCanvas2 {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 3px;
        border-radius: 5px;
        background-image: url('/assets/images/bg/captcha.png');
        color: #fff;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    #captchaError1,
    #captchaError2 {
        color: red;
        display: none;
        font-size: 13px;
    }

    #refreshCaptcha1,
    #refreshCaptcha2 {
        height: 27px;
        width: 27px;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #27427f;
        border: 1px solid #27427f;
    }

    #refreshCaptcha1:hover,
    #refreshCaptcha2:hover {
        background-color: #27427f;
        color: #fff;
    }
</style>

<script>

    let currentCaptcha1 = '';
    let currentCaptcha2 = '';

    function generateCaptcha1(length = 6) {
        const chars1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha1 = '';
        for (let i = 0; i < length; i++) {
            captcha1 += chars1.charAt(Math.floor(Math.random() * chars1.length));
        }
        return captcha1;
    }

    function generateCaptcha2(length = 6) {
        const chars2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha2 = '';
        for (let i = 0; i < length; i++) {
            captcha2 += chars2.charAt(Math.floor(Math.random() * chars2.length));
        }
        return captcha2;
    }

    function showCaptcha1() {
        const canvas = document.getElementById('captchaCanvas1');
        const ctx = canvas.getContext('2d');

        currentCaptcha1 = generateCaptcha1();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 26px "Lexend", sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentCaptcha1, 25, 15);
    }

    function showCaptcha2() {
        const canvas1 = document.getElementById('captchaCanvas2');
        const ctx1 = canvas1.getContext('2d');

        currentCaptcha2 = generateCaptcha2();

        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

        ctx1.font = 'bold 26px "Lexend", sans-serif';
        ctx1.fillStyle = '#fff';
        ctx1.textBaseline = 'middle';
        ctx1.fillText(currentCaptcha2, 25, 15);
    }

    function isNumberKey(evt) {
        const charCode1 = (evt.which) ? evt.which : evt.keyCode;
        return !(charCode1 > 31 && (charCode1 < 48 || charCode1 > 57));
    }

    function isNumberKey1(evt1) {
        const charCode2 = (evt1.which) ? evt1.which : evt1.keyCode;
        return !(charCode2 > 31 && (charCode2 < 48 || charCode2 > 57));
    }

    $(document).ready(function () {
        showCaptcha1();
        showCaptcha2();

        $('#refreshCaptcha1').on('click', function () {
            showCaptcha1();
        });

        $('#refreshCaptcha2').on('click', function () {
            showCaptcha2();
        });
    });

</script>`;

export function VillaDetailsView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
