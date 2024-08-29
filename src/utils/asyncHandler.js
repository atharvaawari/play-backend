
const asyncHandler = (requestHandler) =>{
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
    } 
}

export {asyncHandler}


//higherOrder function is a function that take function as a parameter and also take callback 
//like nested function where we pass the fun to one more function nestedly
// const asyncHandler = () => {}
// const asyncHandler = (func) => {}
// const asyncHandler = (func) => async () => {} 

// const asyncHandler = (func) => async(req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.stauts(err.code || 500).json({
//             success: false,
//             message:error.message
//         })
//     }
// }
