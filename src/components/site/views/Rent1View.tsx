import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<div class="tf-grid-layout md-col-2">



    
        <div class="box-house hover-img">
            <div class="image-wrap">
                

<a href="" target="_blank">
    <img class="lazyload" data-src="" src="" alt="">
</a>



                <ul class="box-tag flex gap-8 ">
                    <li class="flat-tag text-4 bg-main fw-6 text-white">
                          
                    </li>
                </ul>
            </div>
            <div class="content">
                <h5 class="title">
                    <a href="" target="_blank" class="strconvert"></a>

                </h5>
                <p class="location text-1 flex items-center gap-6">
                    <i class="icon-location"></i>
                    ,Coimbatore
                </p>
                <ul class="meta-list flex">
                    <!-- <li class="text-1 flex"><span> Ready to Move</span></li> -->
                    <li class="text-1 flex"><span></span></li>
                    <li class="text-1 flex"><span>  </span></li>

                    </li>
                </ul>
                <div class="bot flex justify-between items-center">
                    <h5 class="price"> ₹
                        
                        <p class="h5 lh-30 fw-4 text-color-default">
                    </h5>
                    <div class="wrap-btn flex">
                        <a href="" target="_blank" class="tf-btn style-border pd-4">Details</a>
                    </div>
                </div>
            </div>
        </div>
    

    
    <img class="elseimg" src = "/assets/images/noproperty.webp" style="margin-left:50%"> 



</div>



    
    <div class="pagination-container">
        <p>
            Showing
            <span style="color: #28427F; font-weight: 600;"></span> to
            <span style="color: #28427F; font-weight: 600;"></span> of
            <span style="color: #28427F; font-weight: 600;"></span> results
        </p>

        <div class="text-center d-flex justify-content-center align-items-center">
            <div class="pagination" style="margin-top: 20px; display: flex; gap: 10px;">
                
                    <button class="page-btn" data-page="">Prev</button>
                

                

                
                    <button class="page-btn " data-page="">
                        
                    </button>
                

                
                    <button class="page-btn" data-page="">Next</button>
                
            </div>


        </div>


    </div>



<style>
    .pagination-container {
        margin-top: 20px;
    }

    .pagination button {
        padding: 6px 12px;
        background: rgb(255, 255, 255);
        border: 1px solid #28427F;
        color: #28427F;
        text-decoration: none;
        border-radius: 4px;
    }

    .pagination button.active {
        background: #28427F;
        color: white;
        font-weight: bold;
        pointer-events: none;
        border: 1px solid #28427F;
    }

    .pagination button:hover:not(.active) {
        background: #ddd;
        color: #28427F;

    }

    .pagination-container p {
        color: #000;
    }
</style>

<script>
$(document).ready(function () {
    $('.strconvert').each(function () {
        let text = $(this).text().toLowerCase().trim();
        let formatted = text.split(' ').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        $(this).text(formatted);
    });
});
</script>`;

export function Rent1View(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
