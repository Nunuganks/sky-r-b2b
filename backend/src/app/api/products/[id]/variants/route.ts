import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../payload.config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    
    // Get the product with its variants
    const product = await payload.findByID({
      collection: 'products',
      id,
      depth: 2,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get variants for this product
    const variants = await payload.find({
      collection: 'product-variants',
      where: {
        product: {
          equals: id,
        },
      },
      depth: 2,
      sort: 'sortOrder',
    })

    return NextResponse.json({
      product,
      variants: variants.docs,
    })
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product variants' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()

    const { variantOptions, price, ownStock, deliveryStock, deliveryTime } = body

    // Validate that the product exists
    const product = await payload.findByID({
      collection: 'products',
      id,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create the variant
    const variant = await payload.create({
      collection: 'product-variants',
      data: {
        product: id,
        variantOptions,
        price: price || product.price,
        ownStock: ownStock || 0,
        deliveryStock: deliveryStock || 0,
        deliveryTime: deliveryTime || product.deliveryTime,
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    console.error('Error creating product variant:', error)
    return NextResponse.json(
      { error: 'Failed to create product variant' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()

    const { variantOptions, price, ownStock, deliveryStock, deliveryTime } = body

    // Get the product
    const product = await payload.findByID({
      collection: 'products',
      id,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate all possible combinations of variant options
    const generateCombinations = (options: any[]) => {
      const types = [...new Set(options.map(opt => opt.type))]
      const optionsByType = types.map(type => 
        options.filter(opt => opt.type === type)
      )
      
      const combinations: any[] = []
      
      const generateCombos = (current: any[], typeIndex: number) => {
        if (typeIndex === types.length) {
          combinations.push([...current])
          return
        }
        
        for (const option of optionsByType[typeIndex]) {
          current.push({ option: option.id })
          generateCombos(current, typeIndex + 1)
          current.pop()
        }
      }
      
      generateCombos([], 0)
      return combinations
    }

    // Get all variant options for this product
    const allVariantOptions = await payload.find({
      collection: 'variant-options',
      where: {
        type: {
          in: product.variantTypes?.map((vt: any) => vt.type) || [],
        },
        active: {
          equals: true,
        },
      },
    })

    const combinations = generateCombinations(allVariantOptions.docs)

    // Create or update variants for each combination
    const createdVariants = []
    for (const combination of combinations) {
      // Check if variant already exists
      const existingVariant = await payload.find({
        collection: 'product-variants',
        where: {
          product: {
            equals: id,
          },
          'variantOptions.option': {
            in: combination.map((c: any) => c.option),
          },
        },
        limit: 1,
      })

      if (existingVariant.docs.length === 0) {
        // Create new variant
        const variant = await payload.create({
          collection: 'product-variants',
          data: {
            product: id,
            variantOptions: combination,
            price: price || product.price,
            ownStock: ownStock || 0,
            deliveryStock: deliveryStock || 0,
            deliveryTime: deliveryTime || product.deliveryTime,
          },
        })
        createdVariants.push(variant)
      }
    }

    return NextResponse.json({
      message: `Created ${createdVariants.length} new variants`,
      variants: createdVariants,
    })
  } catch (error) {
    console.error('Error generating product variants:', error)
    return NextResponse.json(
      { error: 'Failed to generate product variants' },
      { status: 500 }
    )
  }
} 