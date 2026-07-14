import type { BlogPost } from '@/content/site'

const GQL_ENDPOINT = 'https://gql.hashnode.com'

const GET_ALL_POSTS = `
  query GetUser($username: String!) {
    user(username: $username) {
      publications(first: 10) {
        edges {
          node {
            posts(first: 20) {
              edges {
                node {
                  title
                  brief
                  url
                  publishedAt
                  readTimeInMinutes
                  tags {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

type HashnodeTag = { name: string }

type HashnodePostNode = {
  title: string
  brief: string
  url: string
  publishedAt: string
  readTimeInMinutes: number
  tags?: HashnodeTag[]
}

type HashnodePostEdge = { node: HashnodePostNode }

type HashnodePublicationEdge = {
  node?: { posts?: { edges?: HashnodePostEdge[] } }
}

type HashnodeResponse = {
  errors?: unknown
  data?: {
    user?: {
      publications?: {
        edges?: HashnodePublicationEdge[]
      }
    }
  }
}

export async function fetchHashnodePosts(username: string): Promise<BlogPost[]> {
  try {
    const response = await fetch(GQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ALL_POSTS,
        variables: { username },
      }),
    })

    const result: HashnodeResponse = await response.json()

    if (result.errors) {
      console.error('Hashnode API Errors:', result.errors)
      return []
    }

    const publications = result.data?.user?.publications?.edges
    if (!publications) {
      return []
    }

    let allPosts: HashnodePostNode[] = []

    // Extract posts from all publications
    for (const pub of publications) {
      if (pub.node?.posts?.edges) {
        const posts = pub.node.posts.edges.map((edge) => edge.node)
        allPosts = allPosts.concat(posts)
      }
    }

    // Sort all posts by publish date descending
    allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return allPosts.map((node) => ({
      title: node.title,
      summary: node.brief,
      date: node.publishedAt,
      readTime: `${node.readTimeInMinutes} min read`,
      href: node.url,
      tags: node.tags ? node.tags.map((tag) => tag.name) : [],
    }))
  } catch (error) {
    console.error('Error fetching Hashnode posts:', error)
    return []
  }
}
