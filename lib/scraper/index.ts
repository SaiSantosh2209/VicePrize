import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice, extractNumericReviewsCount, extractStarRating } from '../utils';
import { Original_Surfer } from 'next/font/google';


export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    //Bright data proxy configuration 
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //Fetch the product page
        const response = await axios.get(url, options); //used to make the API calls 
        const $ = cheerio.load(response.data);

        //Extract the product Title
        const title = $('#productTitle').text().trim();

        //Extracting the price
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );

        //Extracting the OriginalPrice
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        //Check Availability
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        //Image Extraction
        const images =
            $('imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'))

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
        const starRating = extractStarRating($);

        // Extracting total review count
        const totalReviewCountText = $('span[data-hook="total-review-count"]').text().trim();
        const reviewsCount = extractNumericReviewsCount(totalReviewCountText);


        const description = extractDescription($)

        //Construct Dta objects with the scraped information
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount: reviewsCount,
            stars: starRating,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }

        return data;

    } catch (error: any) { //Fast library fro parsing and manupulating HTML and XML
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}