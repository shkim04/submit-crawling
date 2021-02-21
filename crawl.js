const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
let base_page = 1;
let srcData = [];
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    {id: 'url', title: 'Url'},
  ]
});

async function fetchData(page) {
    try {
        await axios.get(`https://www.coupang.com/np/categories/417869?listSize=60&brand=&offerCondition=&filterType=&isPriceRange=false&minPrice=&maxPrice=&page=${page}&channel=user&fromComponent=Y&selectedPlpKeepFilter=&sorter=bestAsc&filter=&component=417769&rating=0`)
                .then(res => {
                    const $ = cheerio.load(res.data);
                    let total_page = $(".product-list-paging").attr("data-total");
                    let babyHats = $(".baby-product-list > .baby-product");
                    if(babyHats.length === 0) return;
                    
                    babyHats.each(function() {
                        // let src_id = $(this).find(".baby-product-link").attr("data-product-id"); //extract the id of the product
                        let src_url = $(this).find(".baby-product-link >.baby-product-wrap > .image > img").attr("src"); // extract the url of the product
                        srcData.push({ url: src_url });
                    })

                    base_page++; //page shifting
                    if(base_page > total_page) {
                        exportsResult(srcData)
                        return ;
                    };

                    const nextPageLink = base_page;
                
                    setTimeout(() => {
                        fetchData(nextPageLink); //recursion till it reaches the last page
                    }, 2000) //to avoid getting banned by the server
                })
                .catch(err => console.log(err));
    }
    catch(err) {
        console.log(err)
    }
}

function exportsResult(result) {
    // fs.appendFile('output.csv', JSON.stringify(result, null, 1), err => {
    //     if(err) {
    //         console.log(err)
    //     }
    //     console.log("Succesfully exported")
    // })
    csvWriter
        .writeRecords(result)
        .then(()=> console.log('The CSV file was written successfully'));
}

fetchData(base_page);
