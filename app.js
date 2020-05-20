const express=require('express');
const expressGraphql=require('express-graphql');
const {GraphQLSchema,
     GraphQLObjectType,
     GraphQLString,
     GraphQLList,
     GraphQLInt,
     GraphQLNonNull
    } =require('graphql');

const authors=[
    {id:1,name:"nickolas tesla"},
    {id:2,name:"ijaac neuton"},
    {id:3,name:"stephen hawking"},
]
const books=[
    {id:1,name:"electro",author_id:1},
    {id:2,name:"powering earth",author_id:1},
    {id:3,name:"electronic beams",author_id:1},
    {id:4,name:"gravity",author_id:2},
    {id:5,name:"apple made me think",author_id:2},
    {id:6,name:"cosmos",author_id:3},
    {id:7,name:"blackholes",author_id:3},
    {id:8,name:"time travel",author_id:3},
]
const app=express();
const AuthorType=new GraphQLObjectType({
    name:"author",
    description:'author for a book',
    fields:()=>({
       id:{ type: GraphQLNonNull(GraphQLInt) },
       name:{ type: GraphQLNonNull(GraphQLString)},
       books:{
           type:GraphQLList(BookType),
           resolve:(author)=>{
               return books.filter(book=>book.author_id==author.id)
           }
       }
    })
})
const BookType=new GraphQLObjectType({
  name:"book",
  description:"this represents a book",
  fields:()=>({
      id:{type:GraphQLNonNull(GraphQLInt)},
      name: { type: GraphQLNonNull(GraphQLString) },
      author_id: { type: GraphQLNonNull(GraphQLInt) },
      author:{
        type:AuthorType,
        resolve:(book,args)=>{
           return authors.find(({id})=>id==book.id)
        }
    }
  })
})
const rootQuery = new GraphQLObjectType({
    name: "root",
    description:"root Query",
    fields: () => ({
        book:{
            type:BookType,
            description: "a book",
            args:{
                id:{type:GraphQLInt}
            },
            resolve: (parent,args)=>{
                 return books.find(book=>book.id===args.id)
            }
        },
        books: {
            type: GraphQLList(BookType),
            description:"list of books",
            resolve: () =>books
        },
        authors:{
            type:GraphQLList(AuthorType),
            description:"list of authors",
            resolve:()=>authors
        },
        author:{
            type:AuthorType,
            description:"a author",
            args:{
              id:{type:GraphQLInt}
            },
            resolve:(p,args)=>{
                return authors.find(author=>author.id===args.id)
            }
        }
    })
})

const rootMutation=new GraphQLObjectType({
    name:"root_mutation",
    description:"modifies the data",
    fields:()=>({
     addBook:{
         type:BookType,
         args:{
            name: { type: GraphQLNonNull(GraphQLString) },
            author_id: { type: GraphQLNonNull(GraphQLInt) },
         },
         resolve:(p,{name,author_id})=>{
            const book={id:books.length+1,name,author_id};
            books.push(book);
            return book; 
         }
     },
     addAuthor:{
         type:AuthorType,
         args:{
            name: { type: GraphQLNonNull(GraphQLString) },
         },
         resolve:(p,{id,name})=>{
            const author={id:author.length+1,name};
            authors.push(author);
            return author;
         }
     }
    })
})
const schema=new GraphQLSchema({
    query:rootQuery,
    mutation:rootMutation
})
app.use("/graphql",expressGraphql({
    schema:schema,
    graphiql:true,
}));

app.listen(3000,"localhost",()=>{
    console.log("listening at localhost");
})