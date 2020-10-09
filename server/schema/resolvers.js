const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils/auth')

function checkLoggedIn(user) {
    if (user) {
        return 
    }
    throw new AuthenticationError("You aren't logged in!")
}

const resolvers = {
    Query: {
        me: async (parent, args, { user }) => {
            checkLoggedIn(user)
            try {
                console.log(user)
                const foundUser = await User.findOne({username: user.username})
                    .select('-__v -password')
                    return foundUser
            }
            catch(err) {
                console.log(err)
            }
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token, user}
        },
        login: async (parent, { email, password}) => {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new AuthenticationError(("Credentials invalid!"))
                }
                const correctPassword = await user.isCorrectPassword(password)
                if (!correctPassword) {
                    throw new AuthenticationError(("Credentials invalid!"))
                }
                const token = signToken(user)
                return { token, user}

            }
            catch(err) {
                console.log(err)
            }
        },
        saveBook: async (parent, args, { user }) => {
            checkLoggedIn(user)
            const input = args.input
            console.log(input)
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                  )
                return updatedUser
            }
            catch(err) {
                console.log(err)
            }
        },
        removeBook: async(parent, { bookId }, { user }) => {
            checkLoggedIn(user)
            try {
                const updatedUser = await User.findOneAndUpdate(
                    {username: user.username},
                    {$pull: {savedBooks: {bookId} }},
                    {new: true}
                )
                return updatedUser
            }
            catch(err) {
                console.log(err)
            }
        },
    }
}

module.exports = resolvers