// Test property tax and insurance calculations
const testZips = [
  { zip: '84737', location: 'Hurricane, UT', county: 'Washington County' },
  { zip: '86021', location: 'Colorado City, AZ', county: 'Mohave County' },
  { zip: '89052', location: 'Henderson, NV', county: 'Clark County' }
];

const homeValue = 500000;

async function testCalculations() {
  console.log('Testing Property Tax & Insurance Calculations');
  console.log('Home Value: $' + homeValue.toLocaleString());
  console.log('=' .repeat(60));

  for (const { zip, location, county } of testZips) {
    console.log(`\n📍 ZIP: ${zip} (${location}, ${county})`);
    console.log('-'.repeat(40));
    
    // Test 1: ZIP to Location API
    console.log('\n1. Testing ZIP Lookup:');
    try {
      const zipResponse = await fetch(`http://localhost:3000/api/zipcode?zip=${zip}`);
      const zipData = await zipResponse.json();
      console.log(`   ✅ City: ${zipData.city}`);
      console.log(`   ✅ County: ${zipData.county || 'N/A'}`);
      console.log(`   ✅ State: ${zipData.state}`);
    } catch (error) {
      console.log(`   ❌ ZIP Lookup Error: ${error.message}`);
    }
    
    // Test 2: Property Tax API (if it exists)
    console.log('\n2. Testing Property Tax Calculation:');
    try {
      const taxResponse = await fetch('http://localhost:3000/api/property-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: zip,
          state: zip === '84737' ? 'UT' : zip === '86021' ? 'AZ' : 'NV',
          county: county,
          isPrimaryResidence: true,
          homeValue: homeValue
        })
      });
      
      if (taxResponse.ok) {
        const taxData = await taxResponse.json();
        console.log(`   ✅ Annual Tax: $${taxData.estimatedAnnualTax?.toLocaleString() || 'N/A'}`);
        console.log(`   ✅ Monthly Tax: $${(taxData.estimatedAnnualTax / 12)?.toFixed(2) || 'N/A'}`);
        console.log(`   ✅ Effective Rate: ${taxData.applicableRate || 'N/A'}%`);
      } else {
        console.log(`   ⚠️  Property Tax API returned: ${taxResponse.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Property Tax API not available or error: ${error.message}`);
    }
    
    // Test 3: Expected Values (based on typical rates)
    console.log('\n3. Expected Values (rough estimates):');
    const expectedRates = {
      '84737': { rate: 0.0055, desc: 'Utah ~0.55%' },  // Utah has low property taxes
      '86021': { rate: 0.0081, desc: 'Arizona ~0.81%' }, // Arizona moderate
      '89052': { rate: 0.0060, desc: 'Nevada ~0.60%' }  // Nevada relatively low
    };
    
    const expected = expectedRates[zip];
    if (expected) {
      const expectedTax = homeValue * expected.rate;
      console.log(`   📊 Expected Rate: ${expected.desc}`);
      console.log(`   📊 Expected Annual: $${expectedTax.toLocaleString()}`);
      console.log(`   📊 Expected Monthly: $${(expectedTax / 12).toFixed(2)}`);
    }
    
    // Test 4: Insurance estimates
    console.log('\n4. Expected Insurance (rough estimates):');
    const insuranceRates = {
      '84737': { rate: 0.0035, desc: 'Utah low risk ~$1,750/year' },
      '86021': { rate: 0.0040, desc: 'Arizona moderate ~$2,000/year' },
      '89052': { rate: 0.0038, desc: 'Nevada moderate ~$1,900/year' }
    };
    
    const insurance = insuranceRates[zip];
    if (insurance) {
      const expectedInsurance = homeValue * insurance.rate;
      console.log(`   📊 ${insurance.desc}`);
      console.log(`   📊 Annual Insurance: $${expectedInsurance.toLocaleString()}`);
      console.log(`   📊 Monthly Insurance: $${(expectedInsurance / 12).toFixed(2)}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary of what should be working:');
  console.log('1. ZIP API should return county data (via API Ninjas)');
  console.log('2. Property tax should use county for accurate calculations');
  console.log('3. Insurance should use ZIP/county for risk assessment');
  console.log('4. Both should be triggered when ZIP code is entered in app');
}

testCalculations();