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

    .filter-summary-bar {
        background: #ffffff;
        border-top: 1px solid #eef1f6;
        border-bottom: 1px solid #eef1f6;
        padding: 12px 0;
        margin-bottom: 40px;
    }

    .filter-summary-label {
        font-weight: 600;
        color: #1f2a44;
        font-size: 14px;
    }

    .filter-chip {
        display: inline-flex;
        align-items: center;
        background: #f5f7fb;
        border: 1px solid #d9e1f2;
        color: #1f2a44;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 14px;
        line-height: 1;
        white-space: nowrap;
    }

    .filter-clear-btn {
        border-color: #27427F;
        color: #27427F;
        font-weight: 600;
    }

    .filter-clear-btn:hover {
        background-color: #27427F;
        color: #ffffff;
    }

    .flat-title {
        margin-bottom: 0 !important;
    }

    @media (max-width: 767px) {
        .filter-summary-bar {
            padding: 14px 0;
        }

        .filter-summary-row {
            flex-direction: column;
            align-items: flex-start;
        }

        .filter-summary-row .filter-clear-btn {
            width: 100%;
        }
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
    $(document).on('click', '#clearAllFilters', function() {

        var url = new URL(window.location.href);

        var listingType = url.searchParams.get('listingtype');
        var propertyType = url.searchParams.get('propertytype');
        var location = url.searchParams.get('location');

        // CASE 1 → transaction + property + location
        if (listingType && propertyType && location) {

            url.searchParams.delete('location');
            url.searchParams.delete('page');

            window.location.href = url.pathname + '?' + url.searchParams.toString();
            return;
        }

        // CASE 2 → transaction + property only
        if (listingType && propertyType && !location) {

            window.location.href = "/";
            return;
        }

        // fallback
        window.location.href = "/";

    });
</script>

<script>
    $(document).ready(function() {

        const params = new URLSearchParams(window.location.search);

        // store values
        let listingType = params.get('listingtype');
        let propertytype = params.get('propertytype');
        let location = params.get('location');

        // Change button label based on location filter
        if (location) {
            $('#clearAllFilters').text('Clear');
        } else {
            $('#clearAllFilters').text('Clear All');
        }

        console.log("FROM URL:", listingType, propertytype, location);

        function formatChipText(value) {
            if (!value) return '';
            var text = value
                .toString()
                .replace(/[-_]+/g, ' ')
                .toLowerCase()
                .replace(/\\b\\w/g, function(c) {
                    return c.toUpperCase();
                });

            if (text === 'Sell') {
                return 'Buy';
            }

            return text;
        }

        function setChip($chip, value) {
            if (value) {
                $chip.text(formatChipText(value)).removeClass('d-none');
            } else {
                $chip.addClass('d-none');
            }
        }

        setChip($('#chipListing'), listingType);
        setChip($('#chipProperty'), propertytype);
        setChip($('#chipLocation'), location);

        if (!listingType && !propertytype && !location) {
            $('.filter-summary-bar').addClass('d-none');
        }

        // 🔥 direct call
        sendFilter(listingType, propertytype, location, 1);

        // ✅ pagination click
        $(document).on('click', '.page-link', function() {
            let page = $(this).data('page');
            sendFilter(listingType, propertytype, location, page);
        });
    });
</script>

<script>
    function sendFilter(listingType, propertytype, location, page = 1) {

        let formData = {
            listingType: listingType,
            propertytype: propertytype,
            location: location,
            page: page
        };

        console.log("SENDING:", formData);

        $.ajax({
            type: 'POST',
            url: "/Home/filter_search",
            data: formData,
            beforeSend: function() {
                $('#response').empty();
                $('#loader').show();
            },
            success: function(response) {

                let res = JSON.parse(response);

                $('#response').html(res.html);
                $('#resultCountNumber').text(res.count + ' Results |');
                $('#resultHeading').text(res.content);

                $('#loader').hide();
            },
            error: function() {
                $('#loader').hide();
                alert('Error');
            }
        });

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

export function PropertyView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
