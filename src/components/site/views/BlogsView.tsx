import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<style>
    .nice-select .list {
        max-height: 173px;
        overflow-y: auto;
        position: relative;
    }

    .nice-select .input-wrapper {
        position: sticky;
        top: 0;
        background: #fff;
        z-index: 10;
        padding: 8px;
        border-bottom: 1px solid #ddd;
    }

    .form-advanced-search {
        padding: 0 30px 30px 30px;
        border-radius: 16px;
        border: 1px solid rgb(236, 236, 236);
        background-color: var(--White);
        overflow-y: scroll;
        max-height: 500px;
        position: relative;
    }

    .heading-title {
        position: sticky;
        top: 0;
        background-color: #fff;
        z-index: 10;
        padding: 20px 0 20px 0;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
    }

    .flat-account1 {
        padding-top: 50px !important;
        padding-bottom: 0px !important;
    }

    .icons img {
        width: 30px !important;
        height: 30px !important;
    }

    .modal .title-box1 {
        margin-bottom: 0px;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 30px;
        padding: 0px 20px;
    }
</style>

<style>
    @media (max-width: 767px) {

        .resetbtn1 {
            padding: 14px 15px !important;
            padding-bottom: 16px !important;
            border-radius: 5px;
            background-color: #27427F !important;
            color: #fff !important;
            display: block !important;
            margin-left: 8px;
        }

        .resetbtn {
            display: none;
        }

    }

    .resetbtn {
        padding: 14px 15px !important;
        padding-bottom: 16px !important;
        border-radius: 5px;
        margin-left: 7px;
        background-color: #27427F !important;
        color: #fff !important;
    }

    .resetbtn1 {
        display: none;
    }

    .resetbtn:hover {
        background-color: #fff !important;
        color: #27427F !important;
    }

    .rest-sidebar {
        padding: 8px 15px 8px !important;
        border-radius: 4px;
    }

    .rest-sidebar:hover {
        padding: 6px 15px 6px !important;
        border: 1px solid #27427F;
    }

    .input-wrapper {
        width: 100%;
        margin-left: 0px;
        margin-top: 5px;
    }

    .input-wrapper input {
        border-radius: 5px !important;
        height: 40px !important;
    }

    .input-wrapper input::placeholder {
        font-size: 12px !important;
    }

    /* search and soryby css */

    .sortby-col-ul {
        display: flex;
        justify-content: space-between;
    }

    .sortby-col ul li .property-name-search {
        min-width: 500px;
        height: 45px;
        border: 1px solid #27427F;
        padding-left: 25px;
        border-radius: 30px;
    }

    .property-name-search:focus {
        outline: none;
        border: 2px solid #27427F !important;
    }

    .property-name-search::placeholder {
        padding-left: 10px;
        text-transform: capitalize;
        color: var(--Text);
    }

    .sortby-col ul .sortby {
        padding-left: 0px;
    }

    .sortby-col ul .sortby button {
        padding: 11px 17px;
        background-color: #fff;
        color: #27427F;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid #27427F;
    }

    .sortby-col ul .sortby button:hover {
        background-color: #27427F;
        color: #fff;
    }

    .dropdown-menu {
        --bs-dropdown-min-width: 20rem !important;
        padding: 10px 5px;
    }

    .dropdown-item {
        font-size: 14px;
        padding-bottom: 6px;
        padding-top: 6px;
    }

    .dropdown-item:hover {
        color: #fff;
        background-color: #27427F;
    }

    .dropdown-toggle::after {
        display: none !important;
    }

    .btn-check:checked+.btn,
    .btn.active,
    .btn.show,
    .btn:first-child:active,
    :not(.btn-check)+.btn:active {
        color: #fff !important;
        background-color: #27427F !important;
        border-color: #27427F !important;
    }

    .article-content{
        padding:15px;
    }
    .box-house{
        border:none !important;
    }
    .blog-article-item.style-2 .image-wrap{
        margin-bottom:10px !important
    }
    .box-house:hover{
        box-shadow: 0 0 0 0 !important;
    }

    @media (max-width: 767px) {

        .sortby-col ul li .property-name-search {
            min-width: 100px;
            height: 45px;
            border: 1px solid #27427F;
            padding-left: 10px;
            border-radius: 30px;
            margin-top: 30px;
        }

        .sortby-col ul .sortby button {
            padding: 6px;
            background-color: #27427F;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #27427F;
            margin-top: 35px;
        }

        .property-name-search::placeholder {
            padding-left: 10px;
            text-transform: capitalize;
            color: var(--Text);
            font-size: 9px;
        }
    }
</style>


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>



<script>
    $(document).ready(function() {
        sendFilter();

        $(document).on('click', '.page-link', function() {
            const page = $(this).data('page');
            sendFilter(page);
            $('html, body').animate({
                scrollTop: 0
            }, 200);
        });


    });

    let debounceTimer;

 function sendFilter(page = 1) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        $('#loader').show();

        $.ajax({
            type: 'POST',
            url: "/Blogs/get_blogs",
            data: { page: page }, // ✅ THIS IS THE FIX
            beforeSend: function() {
                $('#response').empty();
                $('#loader').show();
            },
            success: function(response) {
                console.log(response);
                $('#response').html(response.html);
                $('#loader').hide();
            },
            error: function() {
                $('#loader').hide();
                alert('An error occurred while loading data.');
            }
        });
    }, 100);
}
</script>


<script>
    $(document).ready(function() {
        $('#toggleFilterBtn').on('click', function() {
            if ($(window).width() <= 767) {
                $('#filterSidebar').slideToggle();
            }
        });
    });
</script>





<!-- loader Script -->

<script>
    const combinedPath = document.getElementById('combinedPath');

    // Get the length of the combined path
    const combinedPathLength = combinedPath.getTotalLength();

    // Set stroke-dasharray and stroke-dashoffset to the path length
    combinedPath.style.strokeDasharray = combinedPathLength;
    combinedPath.style.strokeDashoffset = combinedPathLength;

    // Create a loop animation using JavaScript
    function animatePath() {
        combinedPath.animate([{
                strokeDashoffset: combinedPathLength
            },
            {
                strokeDashoffset: 0
            }
        ], {
            duration: 2000,
            easing: 'ease-in-out', // Smooth easing
            fill: 'forwards'
        }).onfinish = animatePath; // Restart animation after it finishes
    }

    animatePath(); // Start the animation
</script>

<script>
    $(document).ready(function() {
        $('#toggleBudget').on('click', function() {
            // Only initialize if empty
            if ($('#budgetContainer').is(':empty')) {
                const propertyType = $('#propertytype').val();
                const listingType = $('input[name="listingType"]:checked').val() || propertyType;
                if (listingType) {
                    updatePriceRanges(listingType);
                }
            }
            $('#budgetContainer').slideToggle();
        });
        $('#toggleVarient').on('click', function() {
            $('#byUnit').slideToggle();
        });
        $('#toggleFacing').on('click', function() {
            $('#byfacing').slideToggle();
        });
        $('#toggleAge').on('click', function() {
            $('#byAge').slideToggle();
        });
        $('#toggleFloor').on('click', function() {
            $('#byFloor').slideToggle();
        });
        $('#toggleFurnish').on('click', function() {
            $('#byFurnish').slideToggle();
        });
    });
</script>
<script>
    $(document).ready(function() {
        $('.resetbtn, .resetbtn1').click(function(e) {
            e.preventDefault();

            $('.filter-class').prop('checked', false);

            $('input[type="radio"]').prop('checked', false);

            $('.property-name-search').val('');

            $('#locationInput').val('');
            $('#locationTypeDropdown .current').text('Select location');

            $('#selectedSort').val('');

            $('[id^="by"]').slideUp();

            if ($('#budgetContainer').length) {
                $('#budgetContainer').empty();
            }

            const propertyType = $('#propertytype').val();
            if (propertyType === 'Sell' || propertyType === 'Rent') {
                updatePriceRanges(propertyType);
            }

            sendFilter();
        });

        const selectedListingType = $('input[name="listingType"]:checked').val();
        if (selectedListingType) {
            updatePriceRanges(selectedListingType);
        }
    });
</script>`;

export function BlogsView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
