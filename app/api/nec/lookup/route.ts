import { NextRequest, NextResponse } from 'next/server'

// Comprehensive NEC codes database for demonstration
// In production, this would be replaced with a full database or API
const necCodesDatabase = [
  {
    code: '210.12',
    title: 'Arc-Fault Circuit-Interrupter Protection',
    description: 'All 120-volt, single-phase, 15- and 20-ampere branch circuits supplying outlets or devices installed in dwelling unit bedrooms, family rooms, dining rooms, living rooms, parlors, libraries, dens, sunrooms, recreation rooms, closets, hallways, laundry areas, and similar rooms or areas shall be protected by any of the means described in 210.12(A)(1) through (A)(6).',
    category: 'protection',
  },
  {
    code: '210.8',
    title: 'Ground-Fault Circuit-Interrupter Protection',
    description: 'GFCI protection shall be provided for receptacles in bathrooms, kitchens, garages, outdoors, crawl spaces, unfinished basements, and other specified locations. Protection required for personnel.',
    category: 'protection',
  },
  {
    code: '110.14',
    title: 'Electrical Connections',
    description: 'Because of different characteristics of dissimilar metals, devices such as pressure terminal or pressure splicing connectors and soldering lugs shall be identified for the material of the conductor and shall be properly installed and used.',
    category: 'equipment',
  },
  {
    code: '310.16',
    title: 'Ampacities of Insulated Conductors',
    description: 'Tables showing ampacities of insulated conductors rated up to and including 2000 volts, 60°C through 90°C, not more than three current-carrying conductors in raceway, cable, or earth.',
    category: 'wiring',
  },
  {
    code: '230.42',
    title: 'Minimum Size and Rating - Service Conductors',
    description: 'Service conductors shall have an ampacity of not less than the load to be served. For one-family dwellings, the service conductors shall have an ampacity of not less than 100 amperes, 3-wire.',
    category: 'wiring',
  },
  {
    code: '250.4',
    title: 'General Requirements for Grounding and Bonding',
    description: 'Grounding and bonding of electrical systems shall be installed and arranged in a manner that will prevent objectionable current. The path to ground from circuits, equipment, and enclosures shall be permanent and electrically continuous.',
    category: 'grounding',
  },
  {
    code: '250.24',
    title: 'Grounding Electrode Conductor Installation',
    description: 'The grounding electrode conductor shall be connected to the grounded service conductor at the service disconnect or ahead of the service disconnecting means.',
    category: 'grounding',
  },
  {
    code: '300.4',
    title: 'Protection Against Physical Damage',
    description: 'Where subject to physical damage, conductors shall be protected. Cables and raceways through wood members shall be installed so that the edge of the bored hole is not less than 1-1/4 inches from the nearest edge of the wood member.',
    category: 'wiring',
  },
  {
    code: '314.16',
    title: 'Number of Conductors in Outlet Boxes',
    description: 'Boxes shall be of sufficient size to provide free space for all enclosed conductors. Standard box fill calculations apply based on conductor size.',
    category: 'equipment',
  },
  {
    code: '334.10',
    title: 'Uses Permitted - NM Cable',
    description: 'Type NM cable shall be permitted in one-family, two-family, and multifamily dwellings and other structures, both exposed and concealed in normally dry locations.',
    category: 'wiring',
  },
  {
    code: '406.4',
    title: 'Receptacle Mounting',
    description: 'Receptacles shall be mounted in boxes or assemblies designed for the purpose, and such boxes or assemblies shall be securely fastened in place.',
    category: 'equipment',
  },
  {
    code: '408.4',
    title: 'Circuit Directory or Circuit Identification',
    description: 'Every circuit and circuit modification shall be legibly identified as to its clear, evident, and specific purpose or use. The identification shall include sufficient detail to allow each circuit to be distinguished from all others.',
    category: 'equipment',
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase() || ''
    const category = searchParams.get('category')?.toLowerCase()

    let results = necCodesDatabase

    // Filter by category if provided
    if (category && category !== 'all') {
      results = results.filter(code => code.category === category)
    }

    // Search within filtered results
    if (query) {
      results = results.filter(code =>
        code.code.toLowerCase().includes(query) ||
        code.title.toLowerCase().includes(query) ||
        code.description.toLowerCase().includes(query)
      )
    }

    // Sort by relevance (exact code match first, then title match, then description match)
    results.sort((a, b) => {
      const aCodeMatch = a.code.toLowerCase() === query
      const bCodeMatch = b.code.toLowerCase() === query
      if (aCodeMatch && !bCodeMatch) return -1
      if (!aCodeMatch && bCodeMatch) return 1

      const aTitleMatch = a.title.toLowerCase().includes(query)
      const bTitleMatch = b.title.toLowerCase().includes(query)
      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1

      return 0
    })

    return NextResponse.json({
      codes: results,
      total: results.length,
      query,
      category
    })
  } catch (error) {
    console.error('NEC lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup NEC code' },
      { status: 500 }
    )
  }
}
