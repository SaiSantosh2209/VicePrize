"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";

const isValidAmazonProductLink = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    //Amazon se data aane ke liye
    if (
      hostname.includes('amazon.com') ||
      hostname.includes('amazon.in') ||
      hostname.endsWith('amazon')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

const Searchbar = () => {

  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setisLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonProductLink(searchPrompt);

// Alert for provideing proper amazon valid link 

   if(!isValidLink) return alert('Please Enter a valid Amazon product Link 🔗')
   try {
    setisLoading(true);

    // Scrape the product page
    const product = await scrapeAndStoreProduct(searchPrompt);
   } catch (error) {
    console.log(error);
   } finally{
    setisLoading(false);
   }

  }
  return (
    <form className="flex flex-wrap gap-4 mt-12"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter Product Link"
        className="searchbar-input"
      />

      <button type="submit" 
      className="searchbar-btn"
      disabled={searchPrompt === ''}
      >
      {isLoading ? 'Searching...' : 'Search'}
      </button>

    </form>
  )
}

export default Searchbar
