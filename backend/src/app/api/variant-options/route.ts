import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type')
    const active = searchParams.get('active')
    
    const where: any = {}
    
    if (type) {
      where.type = {
        equals: type,
      }
    }
    
    if (active !== null) {
      where.active = {
        equals: active === 'true',
      }
    }
    
    const variantOptions = await payload.find({
      collection: 'variant-options',
      where,
      sort: 'sortOrder',
      depth: 1,
    })
    
    return NextResponse.json(variantOptions)
  } catch (error) {
    console.error('Error fetching variant options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variant options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    
    const { name, type, value, colorCode, sortOrder, active } = body
    
    const variantOption = await payload.create({
      collection: 'variant-options',
      data: {
        name,
        type,
        value,
        colorCode,
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : true,
      },
    })
    
    return NextResponse.json(variantOption)
  } catch (error) {
    console.error('Error creating variant option:', error)
    return NextResponse.json(
      { error: 'Failed to create variant option' },
      { status: 500 }
    )
  }
} 