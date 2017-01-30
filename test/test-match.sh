# Create a game
npm run test-server -- --grep "1001"
npm run test-server -- --grep "2001"
npm run test-server -- --grep "300X"

# Exchange moves
USERNUM=1 npm run test-client &
USERNUM=0 npm run test-client

# End game
npm run test-server -- --grep "400X"

# test completed - cleanup pending clients
# ps -aef | grep "mocha" | sed "s/ \( \)*/ /g" | cut -d' ' -f 3 | xargs kill -9
