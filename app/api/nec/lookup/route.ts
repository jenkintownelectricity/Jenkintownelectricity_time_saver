import { NextRequest, NextResponse } from 'next/server'

// Sample NEC codes for demonstration
const sampleNECCodes = [
  {
    code: '210.12',
    title: 'Arc-Fault Circuit-Interrupter Protection',
    description: 'All 120-volt, single-phase, 15- and 20-ampere branch circuits supplying outlets or devices installed in dwelling unit bedrooms, family rooms, dining rooms, living rooms, parlors, libraries, dens, sunrooms, recreation rooms, closets, hallways, laundry areas, and similar rooms or areas shall be protected by any of the means described in 210.12(A)(1) through (A)(6).',
  },
  {
    code: '110.14',
    title: 'Electrical Connections',
    description: 'Because of different characteristics of dissimilar metals, devices such as pressure terminal or pressure splicing connectors and soldering lugs shall be identified for the material of the conductor and shall be properly installed and used.',
  },
  {
    code: '310.16',
    title: 'Ampacities of Insulated Conductors',
    description: 'Tables showing ampacities of insulated conductors rated up to and including 2000 volts, 60°C through 90°C, not more than three current-carrying conductors in raceway, cable, or earth.',
  },
  {
    code: '230.42',
    title: 'Minimum Size and Rating - Service Conductors',
    description: 'Service conductors shall have an ampacity of not less than the load to be served. For one-family dwellings, the service conductors shall have an ampacity of not less than 100 amperes, 3-wire.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase()

    if (!query) {
      return NextResponse.json({ codes: sampleNECCodes })
    }

    // Simple search through sample codes
    const results = sampleNECCodes.filter(code => 
      code.code.toLowerCase().includes(query) ||
      code.title.toLowerCase().includes(query) ||
      code.description.toLowerCase().includes(query)
    )

    // TODO: Replace with actual NEC database or API
    // This is a placeholder with sample codes
    // In production, you would integrate with a comprehensive NEC code database

    return NextResponse.json({ 
      codes: results,
      placeholder: true,
      message: 'Showing sample NEC codes. Integrate with a full NEC database for production.'
    })
  } catch (error) {
    console.error('NEC lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup NEC code' },
      { status: 500 }
    )
  }
}
