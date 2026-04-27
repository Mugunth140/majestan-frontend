import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<style>
  .error{
        color:red;
    }

    .swal2-popup.large-alert {
			width: 30% !important;
			/* Adjust width as needed */
			font-size: 16px;
			/* Adjust font size */
		}
</style>

<!-- .page-title -->
<div class="page-title style-2" style="background:url(/assets/images/home/rent_sell_property_form.jpg);background-size:cover;">
    <div class="tf-container">
        <div class="row justify-center">
            <div class="col-lg-8">
                <div class="content-inner">

                </div>
            </div>
        </div>
    </div>
</div><!-- .page-title -->

<section class="rent_sell property tf-spacing-2">
    <div class="tf-container">
        <div class="row">
            <div class="col-lg-12">
                <div class="content-inner">
                    <div class="heading-section  mb-48">
                        <h2 class="title text-anime-wave">Rent / Sell Your Property
                        </h2>
                    </div>
                    <div class="content mb-48 wow animate__fadeInUp animate__animated" data-wow-duration="1s" data-wow-delay="0s">
                        <p class="text-1 description-1 mb-16">
                            Welcome to Majestan Realty, your trusted partner in buying or selling property. Our
                            expert team provides tailored service, leveraging cutting-edge tools and local
                            insights for a smooth experience. Contact us today for a free consultation and start
                            your real estate journey with confidence!
                        </p>
                    </div>
                </div>
            </div>

            <div class="col-md-12">
                <form class="gap-30 box-floor-property" id="sellProperty">
                    <div class="grid-layout-3 ">
                        <fieldset class="box-fieldset ">
                            <label for="price">Name<span>*</span> :</label>
                            <input type="text" class="form-control" placeholder="Your Name" name="name">
                        </fieldset>

                        <fieldset class="box-fieldset ">
                            <label for="price">Mobile Number<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Your Mobile Number" name="mobilenumber">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="price">Location<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Property Location" name="location">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="neighborhood">
                                Deal Type<span>*</span> :
                            </label>
                            <div class="nice-select" id="dealTypeDropdown" tabindex="0">
                                <span class="current">Select Deal Type</span>
                                <ul class="list">
                                    <li data-value="Rent Property" class="option">Rent Property</li>
                                    <li data-value="Sale Property" class="option">Sale Property</li>
                                    <li data-value="Buy Property" class="option">Buy Property</li>
                                    <li data-value="Property Management" class="option">Property Management</li>
                                    <li data-value="Liaisoning Service" class="option">Liaisoning Service</li>
                                    <li data-value="Financial Assistance" class="option">Financial Assistance</li>
                                    <li data-value="NRI" class="option">NRI</li>
                                </ul>
                            </div>

                            <input type="hidden" name="dealtype" id="dealtype">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="neighborhood">
                                Property Type<span>*</span> :
                            </label>
                            <div class="nice-select" id="propertyTypeDropdown" tabindex="0">
                                <span class="current">Select Property Type</span>
                                <ul class="list">
                                    <li data-value="Apartment" class="option ">Apartment</li>
                                    <li data-value="Villa" class="option">Villa</li>
                                    <li data-value="Independent House" class="option">Independent House</li>
                                    <li data-value="Plots" class="option ">Plots</li>
                                    <li data-value="Commercial Space" class="option">Commercial Space</li>
                                    <li data-value="Industrial Space" class="option">Industrial Space</li>
                                    <li data-value="Farmland" class="option">Farmland</li>
                                </ul>
                            </div>

                            <input type="hidden" name="propertyType" id="propertyType">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="price">Size<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Property Size" name="size">
                        </fieldset>

                        <fieldset class="box-fieldset ">
                            <label for="price">Number of Rooms<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Number of Rooms" name="rooms">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="neighborhood">
                                Furnishing Status<span>*</span> :
                            </label>
                            <div class="nice-select" id="furnishingTypeDropdown" tabindex="0">
                                <span class="current">Select Furnishing Status</span>
                                <ul class="list">
                                    <li data-value="Fully Furnished" class="option">Fully Furnished</li>
                                    <li data-value="Semi-Furnished" class="option">Semi-Furnished</li>
                                    <li data-value="Un-Furnished" class="option">Un-Furnished</li>
                                </ul>
                            </div>
                            <input type="hidden" name="furnishing_status" id="furnishing_status">
                        </fieldset>

                        <fieldset class="box-fieldset ">
                            <label for="price">Age of Property<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Age of Property" name="ageofproperty">
                        </fieldset>

                        <fieldset class="box-fieldset">
                            <label for="neighborhood">
                                Condition<span>*</span> :
                            </label>
                            <div class="nice-select" id="propertyConditionDropdown" tabindex="0">
                                <span class="current">Select Property Condition</span>
                                <ul class="list">
                                    <li data-value="Ready to Move" class="option">Ready to Move</li>
                                    <li data-value="Available in 1 Month" class="option">Available in 1 Month</li>
                                    <li data-value="Un-Furnished" class="option">Un-Furnished</li>
                                </ul>
                            </div>
                            <input type="hidden" name="propertyCondition" id="propertyCondition">
                        </fieldset>

                        <fieldset class="box-fieldset ">
                            <label for="price">Expected Price<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Enter Expected Price" name="price">
                        </fieldset>
                        <fieldset class="box-fieldset mb-30">
                            <label for="price">Any Details of Property<span>*</span> : </label>
                            <input type="text" class="form-control" placeholder="Any Detail of Property" name="property_details">
                        </fieldset>
                    </div>

                    <div class="row">
                        <div class="col-lg-6">
                            <fieldset class="box-fieldset mb-30">
                                <label for="price">Property Images : </label>
                                <div class="box-floor-img uploadfile">
                                    <a href="#" class="btn-upload tf-btn bg-color-primary pd-10">
                                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.375 13.125L6.67417 8.82583C6.84828 8.65172 7.05498 8.51361 7.28246 8.41938C7.50995 8.32515 7.75377 8.27665 8 8.27665C8.24623 8.27665 8.49005 8.32515 8.71754 8.41938C8.94502 8.51361 9.15172 8.65172 9.32583 8.82583L13.625 13.125M12.375 11.875L13.5492 10.7008C13.7233 10.5267 13.93 10.3886 14.1575 10.2944C14.385 10.2001 14.6288 10.1516 14.875 10.1516C15.1212 10.1516 15.365 10.2001 15.5925 10.2944C15.82 10.3886 16.0267 10.5267 16.2008 10.7008L18.625 13.125M3.625 16.25H17.375C17.7065 16.25 18.0245 16.1183 18.2589 15.8839C18.4933 15.6495 18.625 15.3315 18.625 15V5C18.625 4.66848 18.4933 4.35054 18.2589 4.11612C18.0245 3.8817 17.7065 3.75 17.375 3.75H3.625C3.29348 3.75 2.97554 3.8817 2.74112 4.11612C2.5067 4.35054 2.375 4.66848 2.375 5V15C2.375 15.3315 2.5067 15.6495 2.74112 15.8839C2.97554 16.1183 3.29348 16.25 3.625 16.25ZM12.375 6.875H12.3817V6.88167H12.375V6.875ZM12.6875 6.875C12.6875 6.95788 12.6546 7.03737 12.596 7.09597C12.5374 7.15458 12.4579 7.1875 12.375 7.1875C12.2921 7.1875 12.2126 7.15458 12.154 7.09597C12.0954 7.03737 12.0625 6.95788 12.0625 6.875C12.0625 6.79212 12.0954 6.71263 12.154 6.65403C12.2126 6.59542 12.2921 6.5625 12.375 6.5625C12.4579 6.5625 12.5374 6.59542 12.596 6.65403C12.6546 6.71263 12.6875 6.79212 12.6875 6.875Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        Choose File
                                        <input type="file" class="ip-file" name="image">
                                        
                                    </a>
                                    <p class="file-name">Or drop file here to upload</p>
                                </div>
                            </fieldset>
                        </div>
                        <div class="col-lg-6">
                            <label for="price"> Images<span></span> : </label>
                            <img id="imagePreview" src="#" alt="Preview" style="display: none; margin-top: 15px;" />
                        </div>
                    </div>
                    
                    <fieldset class="mb-4">
                        <div class="d-flex">
                            <div class="d-flex align-items-center mb-2">
                                <canvas id="captchaCanvas1" width="160" height="30"></canvas>
                                <button type="button" class="btn btn-sm btn-outline-secondary ms-2"
                                    id="refreshCaptcha1"><i class="fa-solid fa-rotate-right"></i></button>
                            </div>
                            <div class="ms-5 w-50">
                                <input type="text" class="form-control" id="captchaInput1"
                                    placeholder="Enter CAPTCHA" />
                                <div id="captchaError1">Captcha doesn't match</div>
                            </div>
                        </div>
                    </fieldset>

                    <div class="d-flex justify-content-center">
                        <button type="submit" id="btnSave1" class="tf-btn bg-color-primary pd-13">Submit</a>
                    </div>

                </form>
            </div>
        </div>
    </div>
</section>


<script src="https://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
   $(document).ready(function () {
    $('#dealTypeDropdown .option').click(function () {
        var selectedValue = $(this).attr('data-value');
        $('#dealtype').val(selectedValue);
    });

    $('#propertyTypeDropdown .option').click(function () {
        var selectedValue = $(this).attr('data-value');
        $('#propertyType').val(selectedValue);
    });

    $('#furnishingTypeDropdown .option').click(function () {
        var selectedValue = $(this).attr('data-value');
        $('#furnishing_status').val(selectedValue);
    });

    $('#propertyConditionDropdown .option').click(function () {
        var selectedValue = $(this).attr('data-value');
        $('#propertyCondition').val(selectedValue);
    });

    $('#sellProperty').validate({
        rules: {
            'name': { required: true },
            'mobilenumber': { required: true },
            'location': { required: true },
            'dealtype': { required: true },
            'propertyType': { required: true },
            'size': { required: true },
            'rooms': { required: true },
            'ageofproperty':{required:true},
            'furnishing_status': { required: true },
            'propertyCondition': { required: true },
            'price': { required: true },
            'property_details': { required: true },
          
        },
        messages: {
            'name': 'Please enter your name',
            'mobilenumber': 'Please enter your mobile number',
            'location': 'Please enter your location',
            'dealtype': 'Please select deal type',
            'propertyType': 'Please select property type',
            'size': 'Please enter size',
            'rooms': 'Please enter number of rooms',
            'ageofproperty':'Please enter Age of Property',
            'furnishing_status': 'Please select furnishing status',
            'propertyCondition': 'Please select property condition',
            'price': 'Please enter price',
            'property_details': 'Please enter property details',
          
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
                url: "/Home/insertproperty",
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
                            text: "Property Details Submitted Successfully",
                            confirmButtonColor: "#28a745",
                        }).then(() => {
                            window.location.href = "/Home";
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Something went wrong. Please try again!",
                            confirmButtonColor: "#d33",
                        });
                    }
                    $('#btnSave1').attr('disabled', false).text('Submit');
                },
                error: function () {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Server error! Please try again later.",
                        confirmButtonColor: "#d33",
                    });
                    $('#btnSave1').attr('disabled', false).text('Submit');
                }
            });
        }
    });
});

</script>

<style>
    #captchaCanvas1 {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 3px;
        padding: 6px 12px;
        border-radius: 5px;
        background-image: url('/assets/images/bg/captcha.png');
        color: #fff;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    #captchaError1 {
        color: red;
        display: none;
        font-size: 13px;
    }

    #refreshCaptcha1 {
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

    #refreshCaptcha1:hover {
        background-color: #27427f;
        color: #fff;
    }
</style>

<script>

    let currentCaptcha1 = '';

    function generateCaptcha1(length = 6) {
        const chars1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha1 = '';
        for (let i = 0; i < length; i++) {
            captcha1 += chars1.charAt(Math.floor(Math.random() * chars1.length));
        }
        return captcha1;
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

    function isNumberKey(evt) {
        const charCode1 = (evt.which) ? evt.which : evt.keyCode;
        return !(charCode1 > 31 && (charCode1 < 48 || charCode1 > 57));
    }

    $(document).ready(function () {
        showCaptcha1();

        $('#refreshCaptcha1').on('click', function () {
            showCaptcha1();
        });
    });

</script>



<script>
    document.querySelector('input[name="image"]').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('imagePreview');

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
            preview.src = '#';
        }
    });
</script>`;

export function RentSellPropertyView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
