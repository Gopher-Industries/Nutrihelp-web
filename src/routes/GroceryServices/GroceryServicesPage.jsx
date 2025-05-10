import React from 'react';
import './GroceryServicesPage.css';

const GroceryServicesPage = () => {
  const services = [
    {
      name: 'Coles',
      url: 'https://www.coles.com.au/?srsltid=AfmBOop9Hl5hgMyDTSzai41mPF8mEL0yuL2qUX3FicyqjaivmPvvbOKc',
      logo: '/images/coles-logo.png',
      description: 'Shop fresh groceries online from Coles and have them delivered to your door.'
    },
    {
      name: 'Woolworths',
      url: 'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChsSEwjzrL-ztpWNAxUuDHsHHRAPF1YYACICCAEQBBoCdG0&co=1&ase=2&gclid=Cj0KCQjwrPHABhCIARIsAFW2XBNsalCqmlPHxCHugtaLknY34uzwUTY5t0EFJf3cX5Gcatdsscd4W-YaAvikEALw_wcB&ohost=www.google.com&cid=CAESeOD2kOXBAvhYZ4DNPrvf0nrGrkI9gxRVkWtSjtBK0Ryp0TdwVvkXCJsWNjMj2pJ7b0O7Qye5D3eSp8BKm37I64Hq8Q2wmBdnObuH37DljPS8iYsbNXxweD8JTGCFxglt0kzd7NOAfuH71BNjlACs1zDBpaXIv_VH0Q&sig=AOD64_0DCBdaNX2u6832pnAfHPslz8WGrQ&q&nis=4&adurl&ved=2ahUKEwjl8LqztpWNAxWAhq8BHSF1BPcQ0Qx6BAgKEAE',
      logo: '/images/woolworths-logo.png',
      description: 'Browse Woolworths catalog and order your groceries with ease.'
    }
  ];

  const quotes = [
    { text: 'Let food be thy medicine and medicine be thy food.', author: 'Hippocrates' },
    { text: 'To eat is a necessity, but to eat intelligently is an art.', author: 'François de La Rochefoucauld' },
    { text: 'Fresh fruits and vegetables are nature’s candy.', author: 'Avindya Fernando' }
  ];

  return (
    <div className="grocery-page">
      <h1>Grocery Services</h1>
      <p>
        Access major supermarkets directly from NutriHelp to quickly add
        ingredients and plan your meals:
      </p>

      <div className="services-container">
        {services.map(service => (
          <a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="service-card"
          >
            <div className="service-logo">
              <img src={service.logo} alt={`${service.name} logo`} />
            </div>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <button className="visit-btn">Visit {service.name}</button>
          </a>
        ))}
      </div>

      <div className="healthy-section">
        <h2>Why Eat Fresh & Healthy?</h2>
        <p>
          Eating fresh, nutrient-rich foods daily can boost your energy, support
          your immune system, and improve overall well-being. By choosing
          whole fruits, vegetables, and minimally processed ingredients,
          you’re fueling your body with essential vitamins, minerals, and
          antioxidants that help you thrive. Let these colorful, wholesome
          foods inspire creativity in your meal planning and keep you feeling your best.
        </p>

        <div className="quotes-container">
          {quotes.map((q, i) => (
            <blockquote key={i} className="quote">
              <p>“{q.text}”</p>
              <footer>— {q.author}</footer>
            </blockquote>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default GroceryServicesPage;
